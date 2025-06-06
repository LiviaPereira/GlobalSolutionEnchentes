document.addEventListener("DOMContentLoaded", () => {
  const btnNotificacao = document.getElementById("btnAlertar");
  if (btnNotificacao) {
    btnNotificacao.addEventListener("click", () => {
      alert("Notificações ativadas com sucesso! Você será avisado sobre enchentes na sua região.");
    });
  }

  // Animação dos depoimentos com IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-10');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.depoimento').forEach(el => observer.observe(el));

  const btnCalcular = document.getElementById("btnCalcularRota");
  if (btnCalcular) {
    btnCalcular.addEventListener("click", calculateSafeRoute);
  }
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

});

const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

toggle.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});

menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.add('hidden');
  });
});

let map;
let directionsService;
let directionsRenderer;
let autocomplete;

const floodedAreas = [
  { lat: -23.55052, lng: -46.633305 },
  { lat: -23.556, lng: -46.638 },
  { lat: -23.551, lng: -46.631 },
];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 14,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

  const inputDestino = document.getElementById("destination");
  autocomplete = new google.maps.places.Autocomplete(inputDestino);
  const inputOrigem = document.getElementById("origin");
  const autocompleteOrigem = new google.maps.places.Autocomplete(inputOrigem);

  // Círculos nas áreas alagadas
  floodedAreas.forEach(location => {
    new google.maps.Circle({
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: "#0000FF",
      fillOpacity: 0.5,
      map,
      center: location,
      radius: 500,
    });
  });
}

function calculateSafeRoute() {
  const destinationInput = document.getElementById("destination").value;

  if (!destinationInput) {
    alert("Por favor, digite um destino válido.");
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const request = {
          origin: origin,
          destination: destinationInput,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        };

        directionsService.route(request, (result, status) => {
          if (status === "OK") {
            const safeRoute = result.routes.find(route =>
              !route.overview_path.some(point =>
                floodedAreas.some(floodedPoint =>
                  google.maps.geometry.spherical.computeDistanceBetween(
                    point,
                    new google.maps.LatLng(floodedPoint.lat, floodedPoint.lng)
                  ) < 100
                )
              )
            );

            if (safeRoute) {
              console.log("Rota segura:", safeRoute);
              directionsRenderer.setDirections({
                ...result,
                routes: [safeRoute],
              });
              alert("Rota segura traçada com sucesso!");
            } else {
              alert("Todas as rotas passam por áreas alagadas.");
            }

            // Envio para o servidor Node.js (proxy)
            fetch(`http://localhost:5500/maps?origin=${origin.lat},${origin.lng}&destination=${encodeURIComponent(destinationInput)}`)
              .then(res => res.json())
              .then(data => {
                console.log("Dados recebidos do back-end:", data);
              })
              .catch(err => {
                console.error("Erro ao obter rota do proxy:", err);
              });

          } else {
            alert("Erro ao calcular rota: " + status);
          }
        });
      },
      () => {
        alert("Não foi possível obter sua localização.");
      }
    );
  } else {
    alert("Geolocalização não suportada pelo navegador.");
  }
}
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

window.initMap = initMap;
