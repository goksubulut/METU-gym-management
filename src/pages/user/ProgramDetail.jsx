import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/Button.jsx";

import Card from "../../components/Card.jsx";

import Icon from "../../components/Icon.jsx";

import Modal from "../../components/Modal.jsx";

import Skeleton from "../../components/Skeleton.jsx";

import ProgramItemList from "../../components/ProgramItemList.jsx";

import { useToast } from "../../components/Toast.jsx";

import { getAccessToken } from "../../api/client.js";

import {

  deleteProgram,

  fetchProgram,

  toApiItems,

  updateProgram,

} from "../../api/programs.js";



export default function ProgramDetail() {

  const { id } = useParams();

  const nav = useNavigate();

  const toast = useToast();



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [name, setName] = useState("");

  const [items, setItems] = useState([]);

  const [initialName, setInitialName] = useState("");

  const [initialItemsJson, setInitialItemsJson] = useState("");



  const load = useCallback(async () => {

    if (!getAccessToken()) {

      toast("Programı görmek için giriş yapmalısın", "error");

      nav("/auth");

      return;

    }

    setLoading(true);

    try {

      const program = await fetchProgram(id);

      setName(program.name);

      setItems(program.items);

      setInitialName(program.name);

      setInitialItemsJson(JSON.stringify(program.items.map((i) => ({ t: i.itemType, m: i.machineId, e: i.exerciseId }))));

    } catch (err) {

      toast(err.message ?? "Program yüklenemedi", "error");

      nav("/programs");

    } finally {

      setLoading(false);

    }

  }, [id, nav, toast]);



  useEffect(() => {

    load();

  }, [load]);



  const isDirty =

    name.trim() !== initialName.trim() ||

    JSON.stringify(items.map((i) => ({ t: i.itemType, m: i.machineId, e: i.exerciseId }))) !== initialItemsJson;



  const moveItem = (from, to) => {

    setItems((rows) => {

      const next = [...rows];

      const [row] = next.splice(from, 1);

      next.splice(to, 0, row);

      return next;

    });

  };



  const removeItem = (index) => {

    setItems((rows) => rows.filter((_, i) => i !== index));

  };



  const save = async () => {

    if (!name.trim()) {

      toast("Program adı boş olamaz", "error");

      return;

    }

    if (!items.length) {

      toast("Program en az bir öğe içermeli", "error");

      return;

    }

    setSaving(true);

    try {

      const updated = await updateProgram(id, {

        name: name.trim(),

        items: toApiItems(items),

      });

      setName(updated.name);

      setItems(updated.items);

      setInitialName(updated.name);

      setInitialItemsJson(

        JSON.stringify(updated.items.map((i) => ({ t: i.itemType, m: i.machineId, e: i.exerciseId }))),

      );

      toast("Değişiklikler kaydedildi", "success");

    } catch (err) {

      toast(err.message ?? "Kaydedilemedi", "error");

    } finally {

      setSaving(false);

    }

  };



  const doDelete = async () => {

    setDeleting(true);

    try {

      await deleteProgram(id);

      toast("Program silindi", "success");

      nav("/programs");

    } catch (err) {

      toast(err.message ?? "Silinemedi", "error");

    } finally {

      setDeleting(false);

      setDeleteOpen(false);

    }

  };



  if (loading) {

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

        onClick={() => nav("/programs")}

        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"

      >

        <Icon name="chevronLeft" size={16} />

        Programlarım

      </button>



      <label className="mb-2 block text-xs font-bold text-gray-400">Program adı</label>

      <input

        value={name}

        onChange={(e) => setName(e.target.value)}

        maxLength={80}

        className="mb-6 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-primary-500"

      />



      <h2 className="mb-3 text-base font-bold text-gray-900">Öğeler</h2>

      <ProgramItemList

        items={items}

        onMoveUp={(i) => moveItem(i, i - 1)}

        onMoveDown={(i) => moveItem(i, i + 1)}

        onRemove={removeItem}

      />



      <div className="mt-8 space-y-3">

        <Button full size="lg" onClick={save} disabled={!isDirty || saving}>

          {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}

        </Button>

        <Card className="border-red-100 p-4">

          <p className="mb-3 text-sm font-semibold text-red-700">Tehlikeli bölge</p>

          <Button variant="danger" full onClick={() => setDeleteOpen(true)} disabled={deleting}>

            Programı Sil

          </Button>

        </Card>

      </div>



      <Modal

        open={deleteOpen}

        onClose={() => !deleting && setDeleteOpen(false)}

        title="Programı sil"

        footer={

          <>

            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>

              Vazgeç

            </Button>

            <Button variant="danger" onClick={doDelete} disabled={deleting}>

              {deleting ? "Siliniyor…" : "Evet, programı sil"}

            </Button>

          </>

        }

      >

        <p className="text-sm text-gray-500">

          Bu işlem geri alınamaz. <b>{name}</b> kalıcı olarak silinecek.

        </p>

      </Modal>

    </div>

  );

}

