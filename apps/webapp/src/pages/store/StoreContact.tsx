import "./store.scss";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Title from "../../shared/ui/title/Title";

const PENDING_KEY = "pendingContactOrderId";

function draftKey(orderId) {
  return `contactDraft:${orderId}`;
}

function getDraft(orderId) {
  try {
    const raw = localStorage.getItem(draftKey(orderId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setDraft(orderId, value) {
  try {
    localStorage.setItem(draftKey(orderId), JSON.stringify(value));
  } catch {}
}

function clearDraft(orderId) {
  try {
    localStorage.removeItem(draftKey(orderId));
  } catch {}
}

function clearPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {}
}

export default function StoreContact() {
  const navigate = useNavigate();
  const location = useLocation();
  const { kind } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const returnTo = useMemo(() => {
    const base = location.pathname.replace(/\/contact$/, "");
    return base || `/store/${kind || ""}`;
  }, [location.pathname, kind]);

  const [form, setForm] = useState({ name: "", phone: "", email: "", comment: "" });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const draft = getDraft(orderId);
    if (draft) setForm(draft);
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    if (!touched) return;
    const id = setTimeout(() => setDraft(orderId, form), 250);
    return () => clearTimeout(id);
  }, [orderId, form, touched]);

  const onChange = (key) => (e) => {
    setTouched(true);
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!orderId) return;

    clearDraft(orderId);
    clearPending();
    setTouched(false);

    navigate(returnTo, { replace: true });
  };

  const disabled = !form.name.trim() || (!form.phone.trim() && !form.email.trim());

  return (
    <div className="supportPage">
      <Title>Форма для связи</Title>

      <div style={{ padding: 16, opacity: 0.8 }}>
        orderId: {orderId || "—"}
      </div>

      <form onSubmit={onSubmit} style={{ padding: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ opacity: 0.8 }}>Имя</div>
          <input value={form.name} onChange={onChange("name")} placeholder="Введите имя" />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ opacity: 0.8 }}>Телефон</div>
          <input value={form.phone} onChange={onChange("phone")} placeholder="+7…" />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ opacity: 0.8 }}>Email</div>
          <input value={form.email} onChange={onChange("email")} placeholder="mail@example.com" />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ opacity: 0.8 }}>Комментарий</div>
          <textarea value={form.comment} onChange={onChange("comment")} placeholder="Опишите, как с вами связаться" />
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => navigate(returnTo)}>
            Назад
          </button>

          <button type="submit" disabled={disabled}>
            Отправить
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.65 }}>
          Черновик сохраняется автоматически. Можно выйти и вернуться по этой же ссылке — данные останутся.
        </div>
      </form>
    </div>
  );
}