import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createSupabaseServerClient(); // ✅ 关键：await
        await supabase.auth.exchangeCodeForSession(code);
    }

    // ✅ 作业要求：redirect URI 必须是 /auth/callback
    // 这里是 callback 结束后回到首页（你也可以改成 /viz）
    return NextResponse.redirect(`${origin}/`);
}
