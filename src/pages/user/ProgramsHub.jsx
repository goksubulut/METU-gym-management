import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Icon from "../../components/Icon.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import { useToast } from "../../components/Toast.jsx";
import { getAccessToken } from "../../api/client.js";
import { fetchMyPrograms } from "../../api/programs.js";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProgramsHub() {
  const nav = useNavigate();
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      toast("Programları görmek için giriş yapmalısın", "error");
      nav("/auth");
      return;
    }
    setLoading(true);
    try {
      setPrograms(await fetchMyPrograms());
    } catch (err) {
      toast(err.message ?? "Programlar yüklenemedi", "error");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [nav, toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="px-4 py-5 pb-10">
      <h1 className="mb-1 font-display text-2xl font-bold tracking-tight text-gray-900">
        Antrenman Programları
      </h1>
      <p className="mb-6 text-sm text-gray-400">
        Makine ve egzersizlerden kendi programını oluştur, sırala ve yönet.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card onClick={() => nav("/programs/new")} className="p-4">
          <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary-600 text-white">
            <Icon name="plus" size={20} />
          </div>
          <p className="text-sm font-bold text-gray-900">Program Oluştur</p>
          <p className="text-xs text-gray-500">Yeni program</p>
        </Card>
        <Card className="p-4 opacity-90">
          <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
            <Icon name="clipboard" size={20} />
          </div>
          <p className="text-sm font-bold text-gray-900">Programlarım</p>
          <p className="text-xs text-gray-500">{programs.length} kayıt</p>
        </Card>
      </div>

      <h2 className="mb-3 text-base font-bold text-gray-900">Programlarım</h2>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : programs.length === 0 ? (
        <Card soft className="p-6 text-center">
          <p className="text-sm text-gray-500">Henüz programın yok.</p>
          <Button size="sm" className="mt-4" onClick={() => nav("/programs/new")}>
            İlk Programını Oluştur
          </Button>
        </Card>
      ) : (
        <ul className="space-y-3">
          {programs.map((p) => (
            <li key={p.id}>
              <Link to={`/programs/${p.id}`}>
                <Card className="flex items-center gap-3 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gray-100 text-gray-600">
                    <Icon name="clipboard" size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.itemCount} öğe · {formatDate(p.updatedAt)}
                    </p>
                  </div>
                  <Icon name="chevronRight" size={18} className="shrink-0 text-gray-300" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
