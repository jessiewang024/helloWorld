import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
    // ✅ Next.js 16: cookies() returns a Promise
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // ✅ 优先用 getAll（如果存在）
                getAll() {
                    const fn = (cookieStore as any).getAll;
                    if (typeof fn === "function") return fn.call(cookieStore);

                    // 兜底：如果没有 getAll，就返回空（不会炸）
                    return [];
                },

                // ✅ setAll：写 cookie（如果 set 存在就写，不存在就忽略）
                setAll(cookiesToSet) {
                    try {
                        const setFn = (cookieStore as any).set;
                        if (typeof setFn !== "function") return;

                        cookiesToSet.forEach(({ name, value, options }) => {
                            setFn.call(cookieStore, name, value, options);
                        });
                    } catch {
                        // 某些渲染阶段不允许 set，忽略即可
                    }
                },
            },
        }
    );
}
