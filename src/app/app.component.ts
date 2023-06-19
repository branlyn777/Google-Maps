import { Component } from '@angular/core';
declare const google: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Google-Maps';
  
  position = {
    lat: -33.43463,
    lng: -70.63571
  };

  // Guarda las coordenadas y nombres del archivo kml
  positions = [
    { name: 'Calle Panamericana', lat: -33.43012, lng: -70.63545 },
    { name: 'Punto B', lat: -33.43463, lng: -70.63571 },
    { name: 'Punto C', lat: -33.43717, lng: -70.63532 }
  ];
  
  // 
  label = {
    color: 'blue',
    text: 'Marcador'
  };

  ngOnInit() {
    this.initMap();
  }

  // Muestra y carga el Mapa
  initMap() {
    // Crear una instancia del servicio DirectionsService
    const directionsService = new google.maps.DirectionsService();
    // Crear una instancia del renderer de rutas
    const directionsRenderer = new google.maps.DirectionsRenderer();
    // Configurar las opciones del mapa
    const mapOptions = {
      center: { lat: this.positions[0].lat, lng: this.positions[0].lng },
      zoom: 12,
    };
    // Crear una instancia del mapa y vincularlo al elemento HTML
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    // Asignar el renderer de rutas al mapa
    directionsRenderer.setMap(map);
  
    // Crear los waypoints (puntos intermedios) de la ruta
    const waypoints = this.positions.slice(1, -1).map(pos => ({
      location: new google.maps.LatLng(pos.lat, pos.lng),
      stopover: true
    }));
  
    // Configurar la solicitud de ruta
    const request = {
      origin: new google.maps.LatLng(this.positions[0].lat, this.positions[0].lng),
      destination: new google.maps.LatLng(this.positions[this.positions.length - 1].lat, this.positions[this.positions.length - 1].lng),
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    };
  
    // Enviar la solicitud de ruta al servicio DirectionsService
    directionsService.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
      // Verificar si la solicitud fue exitosa
      if (status == google.maps.DirectionsStatus.OK) {
        // Mostrar la ruta en el mapa utilizando el renderer de rutas
        directionsRenderer.setDirections(result);
      }
    });
  
    // Agregar marcadores adicionales con nombres personalizados
    this.positions.forEach((pos, index) => {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(pos.lat, pos.lng),
        label: {
          text: String.fromCharCode(65 + index) + ". " + pos.name, // Asignar el nombre personalizado con un índice al marcador
          color: "blue",
          // labelOrigin: new google.maps.Point(0, -20) // Ajustar la posición del texto del marcador
        },
        map: map
      });
    });
  }



  //IMPORTAR KML
  
  // Método para manejar el cambio de archivo
  handleFileChange(event: any) {

    // Obtener el archivo seleccionado
    const file = event.target.files[0];

    // Crear un objeto FileReader para leer el contenido del archivo
    const fileReader = new FileReader();
    
    // Definir el evento onload, que se activa cuando se completa la lectura del archivo
    fileReader.onload = (e: any) => {
      // Obtener el contenido del archivo KMZ como una cadena de texto
      const kmzContent = e.target.result;

      // Llamar al método parseKmzContent y pasarle el contenido del archivo KMZ
      this.parseKmzContent(kmzContent);
    };
    // Leer el contenido del archivo como texto
    fileReader.readAsText(file);

  }

  // Método para manejar el contenido del archivo KMZ
  parseKmzContent(kmzContent: string) {
    // Crear un objeto DOMParser para analizar el contenido del archivo KMZ como XML
    const parser = new DOMParser();
    const kmzDocument = parser.parseFromString(kmzContent, 'text/xml');

    // Obtener todos los elementos <Placemark> del documento KMZ
    const placemarks = kmzDocument.getElementsByTagName('Placemark');

    // Array para almacenar los datos de los marcadores
    const placemarkData = [];





    // Eliminar todos los elementos del array positions
    while (this.positions.length > 0) {
      this.positions.splice(0, 1);
    }






    // Iterar sobre los elementos <Placemark>
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];

      // Obtener el nombre del marcador
      const name = placemark.getElementsByTagName('name')[0]?.textContent;

      // Obtener el elemento <coordinates> del marcador
      const coordinatesElement = placemark.getElementsByTagName('coordinates')[0];

      // Obtener las coordenadas como una cadena de texto o asignar null si no está presente
      const coordinates = coordinatesElement ? coordinatesElement.textContent : null;
  
      // Verificar si las coordenadas existen y procesarlas
      if (coordinates) {
        // Dividir las coordenadas en latitud y longitud y convertirlas a números
        const [lng, lat] = coordinates.split(',').map(coord => parseFloat(coord));

        // Agregar los datos del marcador al array placemarkData
        placemarkData.push({ name, lat, lng });


        this.positions.push({ name: name ? name.toString() : '', lat: lat, lng: lng });



      }
    }
    
    console.log(this.positions);
    // Imprimir los nombres y coordenadas de los marcadores en el console log
    // placemarkData.forEach(data => console.log(`Name: ${data.name}, Coordinates: ${data.lat}, ${data.lng}`));
  
    // Actualizar la variable 'positions' con los datos de los marcadores
    // this.positions = placemarkData;


    placemarkData.forEach(data => 
      console.log(`Name: ${data.name}, Coordinates: ${data.lat}, ${data.lng}`)
      );


    // Verificar si se encontraron marcadores y actualizar la variable 'position'
    if (placemarkData.length > 0) {
      const { lat, lng } = placemarkData[0];
      this.position = { lat, lng };
    }
  
  
    this.initMap();
  }

}
