import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Badge from "../../components/Badge.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import ProgramItemList from "../../components/ProgramItemList.jsx";
import { useToast } from "../../components/Toast.jsx";
import MachineSelectCard from "../../components/ui/machine-select-card.jsx";
import { MUSCLES } from "../../components/BodyDiagram.jsx";
import { getAccessToken } from "../../api/client.js";
import { fetchMachines, fetchExercises } from "../../api/catalog.js";
import {
  createProgram,
  fetchProgram,
  toApiItems,
  updateProgram,
} from "../../api/programs.js";
import { sortProgramItems } from "../../utils/programSort.js";
import { slugsForGroup, sortByFineThenCoarse, splitByTargetMatch } from "../../utils/targetMatch.js";

const STEPS = ["Ad", "Kas grupları", "Seçim", "Sırala"];
const EXERCISE_PREVIEW = 2;
const MACHINE_MATCH_PREVIEW = 4;
const OTHER_PREVIEW = 2;

const SECTIONS = [
  { group: "chest", title: "Göğüs" },
  { group: "back", title: "Sırt" },
  { group: "shoulders", title: "Omuz" },
  { group: "arms", title: "Kol" },
  { group: "core", title: "Karın" },
  { group: "glutes", title: "Kalça" },
  { group: "legs", title: "Bacak" },
];

const MUSCLE_ENTRIES = Object.entries(MUSCLES);

function mergeById(rows) {
  const map = new Map();
  for (const row of rows) map.set(row.id, row);
  return [...map.values()];
}

function selectionKey(type, id) {
  return `${type}-${id}`;
}

function draftFromRow(typePrefix, row) {
  if (typePrefix === "m") {
    return {
      key: selectionKey("m", row.id),
      itemType: "MACHINE",
      machineId: row.id,
      exerciseId: null,
      name: row.name,
      exerciseType: null,
    };
  }
  return {
    key: selectionKey("e", row.id),
    itemType: "EXERCISE",
    machineId: null,
    exerciseId: row.id,
    name: row.name,
    exerciseType: row.type,
  };
}

function draftFromProgramItem(item) {
  if (item.itemType === "MACHINE" && item.machineId) {
    return {
      key: selectionKey("m", item.machineId),
      itemType: "MACHINE",
      machineId: item.machineId,
      exerciseId: null,
      name: item.name,
      exerciseType: null,
    };
  }
  if (item.exerciseId) {
    return {
      key: selectionKey("e", item.exerciseId),
      itemType: "EXERCISE",
      machineId: null,
      exerciseId: item.exerciseId,
      name: item.name,
      exerciseType: item.exerciseType,
    };
  }
  return null;
}

function buildDraftFromSelection(knownByKey, selected, preferredOrderKeys = []) {
  const items = [];
  const seen = new Set();
  for (const key of preferredOrderKeys) {
    if (!selected.has(key) || seen.has(key)) continue;
    const row = knownByKey.get(key);
    if (!row) continue;
    items.push(row);
    seen.add(key);
  }
  const added = [];
  for (const key of selected) {
    if (seen.has(key)) continue;
    const row = knownByKey.get(key);
    if (row) added.push(row);
  }
  return [...items, ...sortProgramItems(added)];
}

function SelectionRow({ row, typePrefix, selected, onToggle, sectionGroup }) {
  const key = selectionKey(typePrefix, row.id);
  const checked = selected.has(key);
  return (
    <MachineSelectCard
      machine={row}
      selected={checked}
      onToggle={() => onToggle(key)}
      sectionGroup={sectionGroup}
    />
  );
}

function RowList({
  rows,
  typePrefix,
  selected,
  onToggle,
  sectionGroup,
  expandKey,
  expanded,
  onExpand,
  itemNoun,
  previewLimit,
}) {
  const visible = expanded ? rows : rows.slice(0, previewLimit);
  const hiddenCount = rows.length - previewLimit;
  return (
    <div className="space-y-2">
      {visible.map((row) => (
        <SelectionRow
          key={selectionKey(typePrefix, row.id)}
          row={row}
          typePrefix={typePrefix}
          selected={selected}
          onToggle={onToggle}
          sectionGroup={sectionGroup}
        />
      ))}
      {hiddenCount > 0 && !expanded && (
        <button
          type="button"
          onClick={() => onExpand(expandKey)}
          className="w-full py-1.5 text-center text-xs font-semibold text-accent"
        >
          +{hiddenCount} {itemNoun} daha göster
        </button>
      )}
    </div>
  );
}

function CategorySelection({
  title,
  rows,
  typePrefix,
  selected,
  onToggle,
  expandedKeys,
  onExpand,
  itemNoun,
  muscleSlugs,
  previewLimit = EXERCISE_PREVIEW,
  showOther = false,
  otherPreviewLimit = OTHER_PREVIEW,
}) {
  if (!showOther) {
    const sorted = sortByFineThenCoarse(rows, muscleSlugs, MUSCLES);
    if (!sorted.length) return null;
    return (
      <section className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{title}</p>
        <RowList
          rows={sorted}
          typePrefix={typePrefix}
          selected={selected}
          onToggle={onToggle}
          expandKey={`${title}-list`}
          expanded={expandedKeys.has(`${title}-list`)}
          onExpand={onExpand}
          itemNoun={itemNoun}
          previewLimit={previewLimit}
        />
      </section>
    );
  }

  const groupBlocks = SECTIONS.map((section) => {
    const slugs = slugsForGroup(muscleSlugs, section.group, MUSCLES);
    if (!slugs.length) return null;
    const pool = rows.filter((r) => (r.muscles ?? []).includes(section.group));
    const { matched } = splitByTargetMatch(pool, slugs);
    if (!matched.length) return null;
    return { groupId: section.group, label: section.title, matched };
  }).filter(Boolean);

  const shownIds = new Set(groupBlocks.flatMap((g) => g.matched.map((r) => r.id)));
  const other = rows
    .filter((r) => !shownIds.has(r.id))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  if (!groupBlocks.length && !other.length) return null;

  const otherKey = `${title}-other`;

  return (
    <section className="mt-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="space-y-5">
        {groupBlocks.map(({ groupId, label, matched }) => {
          const expandKey = `${title}-${groupId}`;
          return (
            <div key={groupId}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">{label} için</span>
                <div className="h-px flex-1 bg-gray-100" />
                <Badge tone="primary">{matched.length}</Badge>
              </div>
              <RowList
                rows={matched}
                typePrefix={typePrefix}
                selected={selected}
                onToggle={onToggle}
                sectionGroup={groupId}
                expandKey={expandKey}
                expanded={expandedKeys.has(expandKey)}
                onExpand={onExpand}
                itemNoun={itemNoun}
                previewLimit={previewLimit}
              />
            </div>
          );
        })}
        {other.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Diğer</span>
              <div className="h-px flex-1 bg-gray-100" />
              <Badge>{other.length}</Badge>
            </div>
            <RowList
              rows={other}
              typePrefix={typePrefix}
              selected={selected}
              onToggle={onToggle}
              expandKey={otherKey}
              expanded={expandedKeys.has(otherKey)}
              onExpand={onExpand}
              itemNoun={itemNoun}
              previewLimit={otherPreviewLimit}
            />
          </div>
        )}
      </div>
    </section>
  );
}

async function fetchFullCatalog() {
  const [machines, warmup, free, machineEx, cooldown] = await Promise.all([
    fetchMachines(),
    fetchExercises({ type: "WARMUP" }),
    fetchExercises({ type: "FREE" }),
    fetchExercises({ type: "MACHINE" }),
    fetchExercises({ type: "COOLDOWN" }),
  ]);

  return {
    machines,
    warmup,
    main: mergeById([...free, ...machineEx]),
    cooldown,
  };
}

export default function ProgramCreate() {
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);
  const nav = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [muscleSlugs, setMuscleSlugs] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [knownByKey, setKnownByKey] = useState(() => new Map());
  const [orderedItems, setOrderedItems] = useState([]);
  const [fullCatalog, setFullCatalog] = useState({
    machines: [],
    warmup: [],
    main: [],
    cooldown: [],
  });
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingProgram, setLoadingProgram] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [preferredOrderKeys, setPreferredOrderKeys] = useState([]);

  useEffect(() => {
    if (!getAccessToken()) {
      toast(isEdit ? "Programı düzenlemek için giriş yapmalısın" : "Program oluşturmak için giriş yapmalısın", "error");
      nav("/auth");
    }
  }, [nav, toast, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoadingProgram(true);

    (async () => {
      try {
        const program = await fetchProgram(editId);
        if (cancelled) return;
        setName(program.name);

        const nextKnown = new Map();
        const keys = new Set();
        for (const item of program.items) {
          const draft = draftFromProgramItem(item);
          if (!draft) continue;
          keys.add(draft.key);
          nextKnown.set(draft.key, draft);
        }
        setSelected(keys);
        setKnownByKey(nextKnown);
        setPreferredOrderKeys([...keys]);

        const slugs = (program.targetMuscles ?? []).filter((s) => MUSCLES[s]);
        setMuscleSlugs(slugs);
        setStep(slugs.length ? 3 : keys.size ? 2 : 1);
      } catch (err) {
        if (!cancelled) {
          toast(err.message ?? "Program yüklenemedi", "error");
          nav("/programs");
        }
      } finally {
        if (!cancelled) setLoadingProgram(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEdit, editId, nav, toast]);

  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;
    setLoadingCatalog(true);

    fetchFullCatalog()
      .then((catalog) => {
        if (!cancelled) setFullCatalog(catalog);
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
  }, [step, toast]);

  const catalogFlat = useMemo(
    () => ({
      machines: fullCatalog.machines,
      exercises: mergeById([...fullCatalog.warmup, ...fullCatalog.main, ...fullCatalog.cooldown]),
    }),
    [fullCatalog],
  );

  useEffect(() => {
    if (!catalogFlat.machines.length && !catalogFlat.exercises.length) return;
    setKnownByKey((prev) => {
      const next = new Map(prev);
      for (const m of catalogFlat.machines) next.set(selectionKey("m", m.id), draftFromRow("m", m));
      for (const e of catalogFlat.exercises) next.set(selectionKey("e", e.id), draftFromRow("e", e));
      return next;
    });
  }, [catalogFlat]);

  const hasCatalogContent =
    fullCatalog.machines.length ||
    fullCatalog.warmup.length ||
    fullCatalog.main.length ||
    fullCatalog.cooldown.length;

  const toggleMuscleSlug = (slug) => {
    setMuscleSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    if (!isEdit) {
      setSelected(new Set());
      setExpandedKeys(new Set());
    }
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
    if (step === 2 && muscleSlugs.length === 0 && selected.size === 0) {
      toast("En az bir kas seç", "error");
      return;
    }
    if (step === 3 && selected.size === 0) {
      toast("En az bir makine veya egzersiz seç", "error");
      return;
    }
    if (step === 3) {
      setOrderedItems(buildDraftFromSelection(knownByKey, selected, preferredOrderKeys));
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
      const payload = {
        name: name.trim(),
        items: toApiItems(orderedItems),
        targetMuscles: muscleSlugs,
      };
      const program = isEdit
        ? await updateProgram(editId, payload)
        : await createProgram(payload);
      toast(isEdit ? "Program güncellendi" : "Program kaydedildi", "success");
      nav(`/programs/${program.id}`);
    } catch (err) {
      toast(err.message ?? "Kaydedilemedi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProgram) {
    return (
      <div className="px-4 py-5">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-6 h-12 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 pb-10">
      <button
        type="button"
        onClick={() => (step > 1 ? setStep(step - 1) : nav(isEdit ? `/programs/${editId}` : "/programs"))}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <Icon name="chevronLeft" size={16} />
        Geri
      </button>

      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
        {isEdit ? "Programı düzenle" : `Adım ${step}/${STEPS.length}`}
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
          <p className="mb-4 text-sm text-muted">Programına dahil etmek istediğin kasları seç.</p>
          {muscleSlugs.length > 0 && (
            <p className="mb-4 text-sm font-semibold text-accent">{muscleSlugs.length} kas seçildi</p>
          )}
          <div className="space-y-5">
            {SECTIONS.map(({ group, title }) => {
              const sectionMuscles = MUSCLE_ENTRIES.filter(([, info]) => info.group === group);
              return (
                <div key={group}>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{title}</span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sectionMuscles.map(([slug, info]) => {
                      const isSelected = muscleSlugs.includes(slug);
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => toggleMuscleSlug(slug)}
                          className={[
                            "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors duration-200",
                            isSelected
                              ? "border-primary-600 bg-primary-600/15 text-primary-600"
                              : "border-line bg-surface-2 text-muted",
                          ].join(" ")}
                        >
                          {info.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {muscleSlugs.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {muscleSlugs.map((slug) => (
                <Badge key={slug} tone="primary">
                  {MUSCLES[slug]?.label ?? slug}
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
                rows={fullCatalog.warmup}
                typePrefix="e"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="egzersiz"
                muscleSlugs={muscleSlugs}
                previewLimit={EXERCISE_PREVIEW}
              />
              <CategorySelection
                title="Makineler"
                rows={fullCatalog.machines}
                typePrefix="m"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="makine"
                muscleSlugs={muscleSlugs}
                previewLimit={MACHINE_MATCH_PREVIEW}
                showOther
                otherPreviewLimit={OTHER_PREVIEW}
              />
              <CategorySelection
                title="Serbest & makine egzersizleri"
                rows={fullCatalog.main}
                typePrefix="e"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="egzersiz"
                muscleSlugs={muscleSlugs}
                previewLimit={EXERCISE_PREVIEW}
              />
              <CategorySelection
                title="Soğuma"
                rows={fullCatalog.cooldown}
                typePrefix="e"
                selected={selected}
                onToggle={toggleSelected}
                expandedKeys={expandedKeys}
                onExpand={expandSection}
                itemNoun="egzersiz"
                muscleSlugs={muscleSlugs}
                previewLimit={EXERCISE_PREVIEW}
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
            {submitting ? "Kaydediliyor…" : isEdit ? "Değişiklikleri Kaydet" : "Programı Kaydet"}
          </Button>
        )}
      </div>
    </div>
  );
}
