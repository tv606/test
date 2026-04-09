self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Sadece YouTube embed isteklerine müdahale et
    if (url.includes('youtube.com/embed/')) {
        event.respondWith(
            fetch(event.request, {
                // Modu 'cors' yaparak başlıkları okuma izni alıyoruz
                mode: 'cors',
                credentials: 'omit'
            }).then((response) => {
                // Orijinal yanıt başlıklarını kopyalıyoruz
                const newHeaders = new Headers(response.headers);
                
                // --- ENGEL KALDIRMA ---
                // Bu iki başlık, videonun başka sitede açılmasını önler. Siliyoruz.
                newHeaders.delete('X-Frame-Options');
                newHeaders.delete('Content-Security-Policy');
                
                // Yanıtın 'başarılı' görünmesi için yeni bir response dönüyoruz
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders
                });
            }).catch(err => {
                // Eğer CORS engeli çıkarsa düz fetch'e dön
                return fetch(event.request);
            })
        );
    }
});
