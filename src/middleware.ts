import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Yanıtı Başlat
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Hata yönetimi ekleyelim
    try {
        // 2. Supabase İstemcisi Oluştur
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        // Request cookie'lerini güncelle
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

                        // Response'u güncelle ki cookie'ler geçsin
                        response = NextResponse.next({
                            request,
                        })

                        // Response cookie'lerini ayarla
                        cookiesToSet.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, {
                                ...options,
                                // OTURUM COOKIE'Sİ: Tarayıcı kapanınca silinmesi için süresiz yapıyoruz
                                maxAge: undefined,
                                expires: undefined,
                            })
                        })
                    },
                },
            }
        )

        // 3. Kullanıcı Durumunu Kontrol Et
        // Bu işlem auth token'ı yeniler
        const { data: { user }, error } = await supabase.auth.getUser()

        const path = request.nextUrl.pathname

        // PUBLIC ROUTES - Herkese Açık Yollar
        const isPublicRoute =
            path === '/login' ||
            path.startsWith('/auth') ||
            path.startsWith('/forgot-password') ||
            path.startsWith('/reset-password') ||
            path === '/auth/callback' ||
            // Statik dosyalar
            path.includes('.') ||
            path.startsWith('/_next') ||
            path.startsWith('/api/auth'); // Auth API'leri

        // 4. Yönlendirme Mantığı
        if (!user) {
            // Kullanıcı giriş yapmamışsa ve korumalı alana girmeye çalışıyorsa
            if (!isPublicRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                // Sonsuz döngüden kaçın
                if (path !== '/login') {
                    return NextResponse.redirect(url)
                }
            }
        } else {
            // Kullanıcı giriş YAPMIŞSA

            // Kullanıcı 'login' sayfasına girmeye çalışıyorsa (Zaten giriş yapmış)
            if (path === '/login') {
                // Rolüne göre yönlendir
                const { data: member } = await supabase
                    .from('members')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single()

                const url = request.nextUrl.clone()
                if (member?.is_admin) {
                    url.pathname = '/admin'
                } else {
                    url.pathname = '/profile'
                }
                return NextResponse.redirect(url)
            }

            // Ana sayfa (/) için yönlendirme - ÖNEMLİ!
            if (path === '/') {
                // Eğer filter parametresi varsa (örn: /?filter=president), bunu izin ver
                // Çünkü bu üye listesini filtrelemek için kullanılıyor
                const hasFilter = request.nextUrl.searchParams.has('filter');

                if (!hasFilter) {
                    // Filter yoksa, rolüne göre yönlendir
                    const { data: member } = await supabase
                        .from('members')
                        .select('is_admin')
                        .eq('id', user.id)
                        .single()

                    const url = request.nextUrl.clone()
                    if (member?.is_admin) {
                        // Admin kullanıcısı -> Admin paneline
                        url.pathname = '/admin'
                        return NextResponse.redirect(url)
                    } else {
                        // Normal üye -> Profil sayfasına
                        url.pathname = '/profile'
                        return NextResponse.redirect(url)
                    }
                }
            }

            // Kesin Rol Ayrımı (RBAC)
            if (path.startsWith('/admin')) {
                // Admin sayfasına girmeye çalışıyor, admin mi?
                const { data: member } = await supabase
                    .from('members')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single()

                if (!member?.is_admin) {
                    // Admin değil -> Profil'e gönder
                    const url = request.nextUrl.clone()
                    url.pathname = '/profile'
                    return NextResponse.redirect(url)
                }
            } else if (path.startsWith('/profile')) {
                // Profil sayfasına girmeye çalışıyor, admin mi?
                const { data: member } = await supabase
                    .from('members')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single()

                if (member?.is_admin) {
                    // Admin -> Admin paneline gönder
                    const url = request.nextUrl.clone()
                    url.pathname = '/admin'
                    return NextResponse.redirect(url)
                }
            }
        }

        return response
    } catch (e) {
        // Middleware hatası durumunda uygulamanın çökmesini engelle, isteğe izin ver
        console.error('Middleware Error:', e)
        return NextResponse.next({
            request: {
                headers: request.headers,
            }
        })
    }
}

export const config = {
    matcher: [
        /*
         * Aşağıdakiler HARİÇ tüm istekleri eşleştir:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
