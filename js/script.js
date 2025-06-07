document.addEventListener("DOMContentLoaded", () => {
    // === Lógica de Notificações ===
    const btnAlertar = document.getElementById("btnAlertar");
    const notificationAlert = document.getElementById("notification-alert");
    const notificationMessageSpan = notificationAlert ? notificationAlert.querySelector('span') : null;

    if (btnAlertar && notificationAlert && notificationMessageSpan) {
        btnAlertar.addEventListener("click", () => {
            if (!("Notification" in window)) {
                alert("Este navegador não suporta notificações de desktop.");
                return;
            }

            Notification.requestPermission().then(permission => {
                // Limpa timeouts anteriores para evitar comportamento inesperado ao clicar repetidamente.
                clearTimeout(notificationAlert.hideTimeout);
                clearTimeout(notificationAlert.removeHiddenTimeout);

                if (permission === "granted") {
                    notificationAlert.classList.remove('bg-red-500');
                    notificationAlert.classList.add('bg-green-500');
                    notificationMessageSpan.textContent = "Notificações ativadas com sucesso! Você será avisado sobre enchentes na sua região.";
                    
                    notificationAlert.classList.remove('hidden');
                    // Pequeno atraso para garantir que a transição CSS seja aplicada.
                    notificationAlert.showTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-0', 'scale-95');
                        notificationAlert.classList.add('opacity-100', 'scale-100');
                        notificationAlert.classList.remove('pointer-events-none');
                    }, 50);

                    // Oculta o alerta após 3 segundos.
                    notificationAlert.hideTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-100', 'scale-100');
                        notificationAlert.classList.add('opacity-0', 'scale-95');
                        notificationAlert.classList.add('pointer-events-none');
                        // Remove 'hidden' após a transição de saída.
                        notificationAlert.removeHiddenTimeout = setTimeout(() => {
                            notificationAlert.classList.add('hidden');
                        }, 500);
                    }, 3000);

                } else if (permission === "denied") {
                    notificationAlert.classList.remove('bg-green-500');
                    notificationAlert.classList.add('bg-red-500');
                    notificationMessageSpan.textContent = "Permissão de notificações negada. Não poderemos enviar avisos.";

                    notificationAlert.classList.remove('hidden');
                    notificationAlert.showTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-0', 'scale-95');
                        notificationAlert.classList.add('opacity-100', 'scale-100');
                        notificationAlert.classList.remove('pointer-events-none');
                    }, 50);

                    // Oculta o alerta após 5 segundos.
                    notificationAlert.hideTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-100', 'scale-100');
                        notificationAlert.classList.add('opacity-0', 'scale-95');
                        notificationAlert.classList.add('pointer-events-none');
                        notificationAlert.removeHiddenTimeout = setTimeout(() => {
                            notificationAlert.classList.add('hidden');
                        }, 500);
                    }, 5000);

                } else {
                    console.log("Permissão de notificação não foi aceita.");
                }
            });
        });
    } else {
        console.error("Elementos de notificação não encontrados:", { btnAlertar, notificationAlert, notificationMessageSpan });
    }

    // === Animação de Entrada para Depoimentos (Intersection Observer) ===
    // Observa elementos para animá-los quando entram na viewport.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
                observer.unobserve(entry.target); // Anima apenas uma vez.
            }
        });
    }, { threshold: 0.1 }); // Anima quando 10% do elemento está visível.

    document.querySelectorAll('.depoimento').forEach(el => observer.observe(el));

    // === Lógica de Cálculo de Rota Segura (Botão) ===
    const btnCalcular = document.getElementById("btnCalcularRota");
    if (btnCalcular) {
      btnCalcular.addEventListener("click", calculateSafeRoute);
    }

    // --- CÓDIGO DUPLICADO DE NOTIFICAÇÃO ---
    // Este bloco é uma duplicação da lógica de notificação acima e pode ser removido.
    // O primeiro bloco já é mais completo com feedback visual.
    document.getElementById("btnAlertar").addEventListener("click", () => {
      if (Notification.permission === "granted") {
        new Notification("Você será notificado sobre enchentes!");
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Notificações ativadas com sucesso!");
          }
        });
      }
    });
}); // Fim do DOMContentLoaded

// === Lógica do Menu Hamburger (Mobile) ===
const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');
const menuPath = document.getElementById('menu-path'); 

toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');

    if (!menu.classList.contains('hidden')) {
        menu.classList.remove('opacity-0', 'scale-95');
        menu.classList.add('opacity-100', 'scale-100');
    } else { 
        menu.classList.remove('opacity-100', 'scale-100');
        menu.classList.add('opacity-0', 'scale-95');
    }

    // Altera o ícone do menu (hamburger para 'X' e vice-versa).
    if (menu.classList.contains('opacity-100')) {
        menuPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    } else {
        menuPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
});

menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('opacity-100', 'scale-100');
        menu.classList.add('opacity-0', 'scale-95');

        // Garante que o menu esteja oculto após a transição.
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 300);

        menuPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    });
});

// Fecha o menu ao clicar fora dele.
document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target) && menu.classList.contains('opacity-100')) {
        menu.classList.remove('opacity-100', 'scale-100');
        menu.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            menu.classList.add('hidden');
        }, 300);

        menuPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
});

// === Lógica do Google Maps API e Cálculo de Rota ===
let map;
let directionsService;
let directionsRenderer;
let autocomplete;

// Coordenadas de áreas de exemplo que são consideradas alagadas.
const floodedAreas = [
    { lat: -23.55052, lng: -46.633305 },
    { lat: -23.556, lng: -46.638 },
    { lat: -23.551, lng: -46.631 },
];

// Função de inicialização do mapa (chamada via callback pela API do Google Maps).
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -23.55052, lng: -46.633308 },
        zoom: 14,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    // Configura o autocompletar para os campos de origem e destino.
    const inputDestino = document.getElementById("destination");
    autocomplete = new google.maps.places.Autocomplete(inputDestino);
    const inputOrigem = document.getElementById("origin");
    const autocompleteOrigem = new google.maps.places.Autocomplete(inputOrigem);

    // Desenha círculos no mapa para indicar as áreas alagadas.
    floodedAreas.forEach(location => {
        new google.maps.Circle({
            strokeColor: "#0000FF", strokeOpacity: 0.8, strokeWeight: 1,
            fillColor: "#0000FF", fillOpacity: 0.5,
            map, center: location, radius: 500,
        });
    });
}

// Função para calcular e exibir uma rota segura, evitando áreas alagadas.
function calculateSafeRoute() {
    const destinationInput = document.getElementById("destination").value;
    const originInput = document.getElementById("origin").value;

    if (!destinationInput) {
        alert("Por favor, digite um destino válido.");
        return;
    }

    if (destinationInput.length < 10) {
        alert("Digite um destino mais específico (ex: Rua Tal, nº 123, Bairro).");
        return;
    }

    const calcularERenderizar = (origin) => {
        new google.maps.Marker({ position: origin, map, title: "Origem" });

        const request = {
            origin: origin,
            destination: destinationInput,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true, // Solicita rotas alternativas.
        };

        directionsService.route(request, (result, status) => {
            if (status === "OK") {
                // Encontra a primeira rota que não passe por nenhuma área alagada.
                const safeRoute = result.routes.find(route =>
                    !route.overview_path.some(point =>
                        floodedAreas.some(floodedPoint =>
                            google.maps.geometry.spherical.computeDistanceBetween(
                                point,
                                new google.maps.LatLng(floodedPoint.lat, floodedPoint.lng)
                            ) < 100 // Ponto da rota a 100m ou menos de uma área alagada.
                        )
                    )
                );

                if (safeRoute) {
                    directionsRenderer.setDirections({ ...result, routes: [safeRoute] });
                    alert("Rota segura traçada com sucesso!");
                } else {
                    alert("Todas as rotas passam por áreas alagadas.");
                }

                // Envia dados da rota para o backend via proxy.
                fetch(`http://localhost:5500/maps?origin=${origin.lat?.() || origin}&destination=${encodeURIComponent(destinationInput)}`)
                    .then(res => res.json())
                    .then(data => { console.log("Dados do back-end:", data); })
                    .catch(err => { console.error("Erro ao buscar rota no proxy:", err); });

            } else {
                alert("Erro ao calcular rota: " + status);
            }
        });
    };

    // Determina a origem da rota: campo de origem ou geolocalização do usuário.
    if (originInput) {
        calcularERenderizar(originInput);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userOrigin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                calcularERenderizar(userOrigin);
            },
            () => { alert("Não foi possível obter sua localização."); }
        );
    } else {
        alert("Geolocalização não suportada e origem não especificada.");
    }
}

// === Animação de Scroll Suave para Links Âncora ===
// Adiciona scroll suave ao clicar em links âncora (#).
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// Expõe a função initMap globalmente, necessária para o callback da API do Google Maps.
window.initMap = initMap;