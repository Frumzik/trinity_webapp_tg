import { useEffect, useState } from "react";
import { api } from "../../shared/api/baseApi";
import { endpoints } from "../../shared/api/endpoints";

type RefUser = { id: number; name: string; joinedAt: string };

export default function ReferralsPage() {
  const [users, setUsers] = useState<RefUser[]>([]);
  useEffect(() => {
    api.get(endpoints.referrals).then((r) => setUsers(r.data.users));
  }, []);
  return (
    <div>
      <h1>Рефералы</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
