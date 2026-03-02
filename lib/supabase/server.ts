import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
    // Next.js 16: cookies() is async
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const fn = (cookieStore as any).getAll;
                    if (typeof fn === "function") return fn.call(cookieStore);
                    return [];
                },

                setAll(cookiesToSet) {
                    try {
                        const setFn = (cookieStore as any).set;
                        if (typeof setFn !== "function") return;

                        cookiesToSet.forEach(({ name, value, options }) => {
                            setFn.call(cookieStore, name, value, options);
                        });
                    } catch {
                        // set not allowed during certain render phases
                    }
                },
            },
        }
    );
}
