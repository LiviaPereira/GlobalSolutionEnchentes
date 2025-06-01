document.addEventListener("DOMContentLoaded", () => {
  const btnNotificacao = document.getElementById("btnAlertar");
  if (btnNotificacao) {
    btnNotificacao.addEventListener("click", () => {
      alert("Notificações ativadas com sucesso! Você será avisado sobre enchentes na sua região.");
    });
  }

  const btnCalcular = document.getElementById("btnCalcularRota");
  if (btnCalcular) {
    btnCalcular.addEventListener("click", calculateSafeRoute);
  }
});

let map;
let directionsService;
let directionsRenderer;
let autocomplete;

const floodedAreas = [
  { lat: -23.55052, lng: -46.633308 },
  { lat: -23.551, lng: -46.634 },
  { lat: -23.553, lng: -46.631 },
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

  // Desenha círculos para áreas alagadas
  floodedAreas.forEach((location) => {
    new google.maps.Circle({
      strokeColor: "#0000FF",
      strokeOpacity: 0.6,
      strokeWeight: 1,
      fillColor: "#0000FF",
      fillOpacity: 0.3,
      map,
      center: location,
      radius: 100, // 100 metros de raio
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
      (position) => {
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
            // Verifica todas as rotas disponíveis e escolhe a mais segura
            const safeRoute = result.routes.find((route) =>
              !route.overview_path.some((point) =>
                floodedAreas.some((floodedPoint) =>
                  google.maps.geometry.spherical.computeDistanceBetween(
                    point,
                    new google.maps.LatLng(floodedPoint.lat, floodedPoint.lng)
                  ) < 100
                )
              )
            );

            if (safeRoute) {
              directionsRenderer.setDirections({
                routes: [safeRoute],
              });
              alert("Rota segura traçada com sucesso!");
            } else {
              alert("Todas as rotas passam por áreas alagadas. Tente um destino diferente ou aguarde atualizações.");
            }
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
window.initMap = initMap;
