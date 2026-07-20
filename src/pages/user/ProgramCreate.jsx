import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import ProgramItemList from "../../components/ProgramItemList.jsx";
import { useToast } from "../../components/Toast.jsx";
import { MUSCLE_GROUPS } from "../../mock/machines.js";
import { getAccessToken } from "../../api/client.js";
import { fetchMachines, fetchExercises } from "../../api/catalog.js";
import { createProgram, toApiItems } from "../../api/programs.js";
import { sortProgramItems } from "../../utils/programSort.js";

const STEPS = ["Ad", "Kas grupları", "Seçim", "Sırala"];
const PREVIEW_LIMIT = 4;

function mergeById(rows) {
  const map = new Map();
  for (const row of rows) map.set(row.id, row);
  return [...map.values()];
}

function selectionKey(type, id) {
  return `${type}-${id}`;
}

function groupLabel(groupId) {
  return MUSCLE_GROUPS.find((x) => x.id === groupId)?.label ?? groupId;
}

function buildDraftFromSelection(catalogFlat, selected) {
  const items = [];
  for (const m of catalogFlat.machines) {
    const key = selectionKey("m", m.id);
    if (selected.has(key)) {
      items.push({
        key,
        itemType: "MACHINE",
        machineId: m.id,
        exerciseId: null,
        name: m.name,
        exerciseType: null,
      });
    }
  }
  for (const e of catalogFlat.exercises) {
    const key = selectionKey("e", e.id);
    if (selected.has(key)) {
      items.push({
        key,
        itemType: "EXERCISE",
        machineId: null,
        exerciseId: e.id,
        name: e.name,
        exerciseType: e.type,
      });
    }
  }
  return sortProgramItems(items);
}

function SelectionRow({ row, typePrefix, selected, onToggle }) {
  const key = selectionKey(typePrefix, row.id);
  const checked = selected.has(key);

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
        checked ? "border-primary-600 bg-primary-50" : "border-gray-100 bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(key)}
        className="h-4 w-4 accent-primary-600"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{row.name}</p>
        {row.duration && <p className="text-xs text-gray-400">{row.duration}</p>}
        {row.location && <p className="text-xs text-gray-400">{row.location}</p>}
      </div>
    </label>
  );
}

function CategorySelection({ title, catalogByGroup, rowKey, typePrefix, selected, onToggle, expandedKeys, onExpand, itemNoun }) {
  const groupsWithRows = catalogByGroup
    .map((g) => ({ groupId: g.groupId, label: g.label, rows: g[rowKey] }))
    .filter((g) => g.rows.length > 0);

  if (!groupsWithRows.length) return null;

  return (
    <section className="mt-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="space-y-5">
        {groupsWithRows.map(({ groupId, label, rows }) => {
          const expandKey = `${rowKey}-${groupId}`;
          const expanded = expandedKeys.has(expandKey);
          const visible = expanded ? rows : rows.slice(0, PREVIEW_LIMIT);
          const hiddenCount = rows.length - PREVIEW_LIMIT;

          return (
            <div key={groupId}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">{label} için</span>
                <div className="h-px flex-1 bg-gray-100" />
                <Badge tone="primary">{rows.length}</Badge>
              </div>
              <div className="space-y-2">
                {visible.map((row) => (
                  <SelectionRow
                    key={selectionKey(typePrefix, row.id)}
                    row={row}
                    typePrefix={typePrefix}
                    selected={selected}
                    onToggle={onToggle}
                  />
                ))}
                {hiddenCount > 0 && !expanded && (
                  <button
                    type="button"
                    onClick={() => onExpand(expandKey)}
                    className="w-full py-1.5 text-center text-xs font-semibold text-primary-600"
                  >
                    +{hiddenCount} {itemNoun} daha göster
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

async function fetchGroupCatalog(groupId) {
  const [machines, warmup, free, machineEx, cooldown] = await Promise.all([
    fetchMachines({ muscleGroup: groupId }),
    fetchExercises({ muscleGroup: groupId, type: "WARMUP" }),
    fetchExercises({ muscleGroup: groupId, type: "FREE" }),
    fetchExercises({ muscleGroup: groupId, type: "MACHINE" }),
    fetchExercises({ muscleGroup: groupId, type: "COOLDOWN" }),
  ]);

  return {
    groupId,
    label: groupLabel(groupId),
    machines,
    warmup,
    main: mergeById([...free, ...machineEx]),
    cooldown,
  };
}

export default function ProgramCreate() {
  const nav = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [orderedItems, setOrderedItems] = useState([]);
  const [catalogByGroup, setCatalogByGroup] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      toast("Program oluşturmak için giriş yapmalısın", "error");
      nav("/auth");
    }
  }, [nav, toast]);

  useEffect(() => {
    if (step !== 3 || groups.length === 0) return;
    let cancelled = false;
    setLoadingCatalog(true);

    Promise.all(groups.map((g) => fetchGroupCatalog(g)))
      .then((rows) => {
        if (!cancelled) setCatalogByGroup(rows);
      })
      .catch((err) => {
        if (!cancelled) toast(err.message ?? "Katalog yüklenemedi", "error");
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, groups, toast]);

  const catalogFlat = useMemo(
    () => ({
      machines: mergeById(catalogByGroup.flatMap((g) => g.machines)),
      exercises: mergeById(
        catalogByGroup.flatMap((g) => [...g.warmup, ...g.main, ...g.cooldown]),
      ),
    }),
    [catalogByGroup],
  );

  const hasCatalogContent = catalogByGroup.some(
    (g) => g.machines.length || g.warmup.length || g.main.length || g.cooldown.length,
  );

  const toggleGroup = (id) => {
    setGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
    setSelected(new Set());
    setExpandedKeys(new Set());
    setCatalogByGroup([]);
  };

  const toggleSelected = (key) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const expandSection = (key) => setExpandedKeys((s) => new Set([...s, key]));

  const goNext = () => {
    if (step === 1 && !name.trim()) {
      toast("Program adı gir", "error");
      return;
    }
    if (step === 2 && groups.length === 0) {
      toast("En az bir kas grubu seç", "error");
      return;
    }
    if (step === 3 && selected.size === 0) {
      toast("En az bir makine veya egzersiz seç", "error");
      return;
    }
    if (step === 3) {
      setOrderedItems(buildDraftFromSelection(catalogFlat, selected));
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moveItem = (from, to) => {
    setOrderedItems((items) => {
      const next = [...items];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  };

  const removeItem = (index) => {
    setOrderedItems((items) => items.filter((_, i) => i !== index));
  };

  const applyDefaultOrder = () => {
    setOrderedItems((items) => sortProgramItems(items));
  };

  const save = async () => {
    if (!orderedItems.length) {
      toast("Program en az bir öğe içermeli", "error");
      return;
    }
    setSubmitting(true);
    try {
      const program = await createProgram({
        name: name.trim(),
        items: toApiItems(orderedItems),
      });
      toast("Program kaydedildi", "success");
      nav(`/programs/${program.id}`);
    } catch (err) {
      toast(err.message ?? "Kaydedilemedi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-5 pb-10">
      <button
        type="button"
        onClick={() => (step > 1 ? setStep(step - 1) : nav("/programs"))}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <Icon name="chevronLeft" size={16} />
        Geri
      </button>

      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
        Adım {step}/{STEPS.length}
      </p>
      <h1 className="mb-6 font-display text-xl font-bold tracking-tight text-gray-900">
        {STEPS[step - 1]}
      </h1>

      {step === 1 && (
        <div>
          <label className="mb-2 block text-xs font-bold text-gray-400">Program adı</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Örn. Üst vücut günü"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-primary-500"
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-4 text-sm text-gray-400">Programına dahil etmek istediğin kas gruplarını seç.</p>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGroup(g.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors active:scale-[0.96] ${
                  groups.includes(g.id)
                    ? "border-primary-600 bg-primary-50 text-primary-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {groups.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {groups.map((g) => (
                <Badge key={g} tone="primary">
                  {groupLabel(g)}
                </Badge>
              ))}
            </div>
          )}

          {loadingCatalog ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <CategorySelection
                title="Isınma"
                catalogByGroup={catalogByGroup}
                rowKey="warmup"
                typePrefix="e"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="egzersiz"
              />
              <CategorySelection
                title="Makineler"
                catalogByGroup={catalogByGroup}
                rowKey="machines"
                typePrefix="m"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="makine"
              />
              <CategorySelection
                title="Serbest & makine egzersizleri"
                catalogByGroup={catalogByGroup}
                rowKey="main"
                typePrefix="e"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="egzersiz"
              />
              <CategorySelection
                title="Soğuma"
                catalogByGroup={catalogByGroup}
                rowKey="cooldown"
                typePrefix="e"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="egzersiz"
              />
              {!hasCatalogContent && (
                <p className="text-sm text-gray-400">Seçili gruplar için içerik bulunamadı.</p>
              )}
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <p className="mb-4 text-sm text-gray-400">
            Sıralamayı yukarı/aşağı oklarla düzenleyebilirsin. Varsayılan: ısınma → makine/egzersiz → soğuma.
          </p>
          <Button variant="outline" size="sm" className="mb-4" onClick={applyDefaultOrder}>
            Varsayılan sıraya dön
          </Button>
          <ProgramItemList
            items={orderedItems}
            onMoveUp={(i) => moveItem(i, i - 1)}
            onMoveDown={(i) => moveItem(i, i + 1)}
            onRemove={removeItem}
          />
        </div>
      )}

      <div className="mt-8">
        {step < 4 ? (
          <Button full size="lg" onClick={goNext} disabled={step === 3 && loadingCatalog}>
            Devam
          </Button>
        ) : (
          <Button full size="lg" onClick={save} disabled={submitting}>
            {submitting ? "Kaydediliyor…" : "Programı Kaydet"}
          </Button>
        )}
      </div>
    </div>
  );
}
