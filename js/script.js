document.addEventListener("DOMContentLoaded", () => {
    const btnAlertar = document.getElementById("btnAlertar");
    const notificationAlert = document.getElementById("notification-alert");
    const notificationMessageSpan = notificationAlert ? notificationAlert.querySelector('span') : null; // Get the span for the message

    if (btnAlertar && notificationAlert && notificationMessageSpan) {
        btnAlertar.addEventListener("click", () => {
            // Check if Notification API is supported by the browser
            if (!("Notification" in window)) {
                alert("Este navegador não suporta notificações de desktop.");
                return; // Exit if not supported
            }

            // Request permission from the user
            Notification.requestPermission().then(permission => {
                // Clear any previous timeouts if button is clicked rapidly
                clearTimeout(notificationAlert.hideTimeout);
                clearTimeout(notificationAlert.removeHiddenTimeout);

                if (permission === "granted") {
                    // Permission granted, show success message
                    notificationAlert.classList.remove('bg-red-500'); // Ensure it's not red from a previous error
                    notificationAlert.classList.add('bg-green-500'); // Set to green for success
                    notificationMessageSpan.textContent = "Notificações ativadas com sucesso! Você será avisado sobre enchentes na sua região.";
                    
                    // Show animation
                    notificationAlert.classList.remove('hidden');
                    notificationAlert.showTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-0', 'scale-95');
                        notificationAlert.classList.add('opacity-100', 'scale-100');
                        notificationAlert.classList.remove('pointer-events-none');
                    }, 50);

                    // Hide animation after 3 seconds
                    notificationAlert.hideTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-100', 'scale-100');
                        notificationAlert.classList.add('opacity-0', 'scale-95');
                        notificationAlert.classList.add('pointer-events-none');
                        notificationAlert.removeHiddenTimeout = setTimeout(() => {
                            notificationAlert.classList.add('hidden');
                        }, 500);
                    }, 3000);

                    // Optionally, you can now trigger an actual browser notification
                    // if you want to test it immediately or send a welcome notification.
                    // new Notification("Notificações Ativadas", {
                    //     body: "Você receberá alertas sobre enchentes."
                    // });

                } else if (permission === "denied") {
                    // Permission denied, show an error message (e.g., red notification)
                    notificationAlert.classList.remove('bg-green-500'); // Ensure it's not green from a previous success
                    notificationAlert.classList.add('bg-red-500');    // Set to red for error
                    notificationMessageSpan.textContent = "Permissão de notificações negada. Não poderemos enviar avisos.";

                    // Show animation (same as success, just different color/message)
                    notificationAlert.classList.remove('hidden');
                    notificationAlert.showTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-0', 'scale-95');
                        notificationAlert.classList.add('opacity-100', 'scale-100');
                        notificationAlert.classList.remove('pointer-events-none');
                    }, 50);

                    // Hide animation after 5 seconds (maybe longer for an error)
                    notificationAlert.hideTimeout = setTimeout(() => {
                        notificationAlert.classList.remove('opacity-100', 'scale-100');
                        notificationAlert.classList.add('opacity-0', 'scale-95');
                        notificationAlert.classList.add('pointer-events-none');
                        notificationAlert.removeHiddenTimeout = setTimeout(() => {
                            notificationAlert.classList.add('hidden');
                        }, 500);
                    }, 5000); // Keep error message longer

                } else {
                    // 'default' means user closed the prompt without making a choice
                    // You might choose to do nothing or show a subtle message
                    console.log("Permissão de notificação não foi aceita.");
                    // Optionally, you could show a temporary message like "Por favor, aceite a permissão para ativar notificações."
                }
            });
        });
    } else {
        console.error("Notification elements not found:", { btnAlertar, notificationAlert, notificationMessageSpan });
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

    setTimeout(() => {
      menu.classList.add('hidden');
    }, 300);

    menuPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
  });
});

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
    new google.maps.Marker({
      position: origin,
      map,
      title: "Origem",
    });

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
          directionsRenderer.setDirections({
            ...result,
            routes: [safeRoute],
          });
          alert("Rota segura traçada com sucesso!");
        } else {
          alert("Todas as rotas passam por áreas alagadas.");
        }

        fetch(`http://localhost:5500/maps?origin=${origin.lat?.() || origin}&destination=${encodeURIComponent(destinationInput)}`)
          .then(res => res.json())
          .then(data => {
            console.log("Dados do back-end:", data);
          })
          .catch(err => {
            console.error("Erro ao buscar rota no proxy:", err);
          });

      } else {
        alert("Erro ao calcular rota: " + status);
      }
    });
  };

  if (originInput) {
    // Se o usuário digitou a origem, usamos ela como string
    calcularERenderizar(originInput);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const userOrigin = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        calcularERenderizar(userOrigin);
      },
      () => {
        alert("Não foi possível obter sua localização.");
      }
    );
  } else {
    alert("Geolocalização não suportada e origem não especificada.");
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
