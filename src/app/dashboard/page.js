import { supabase } from "@/lib/supabase";

export default async function Dashboard() {

  const { data: classes, error } = await supabase
    .from("classes")
    .select("*");

  if (error) {
    console.log(error);
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {classes?.map((a) => (
        <p key={a.id}>{a.name}</p>
      ))}
    </div>
  );
}