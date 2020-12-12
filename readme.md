# Prueba Técnica - NodeJS Developer

Crear un microservicio  en el cual internamente se integrará con APIs de dolar, uf y utm del día actual.

Una característica importante del desarrollo es que debe ir alojando la data consultada en una base de datos mongodb y una vez que es almacenada, las siguientes consultas serán respondidas directamente de lo almacenado en Mongo, de esta forma utilizaremos mongo tanto para almacenar la información como mecanismo de caché, evitando ir por cada consulta a cada una de las apis.

A continuación se detalla diagrama de secuencia de alto nivel que detalla la situación antes expuesta.

![](IndicadoresFinancieros.png)

![swagger.yaml](swagger.yaml)



## Informacion de APIS a integrar.

La siguiente información de las apis a integrar que se detallan a continuación.

### Dolar (GET https://currency26.p.rapidapi.com/convert/USD/CLP/1)
```
curl --request GET \
	--url 'https://currency26.p.rapidapi.com/convert/USD/CLP/1' \
	--header 'x-rapidapi-host: currency26.p.rapidapi.com' \
	--header 'x-rapidapi-key: 3e145c02a5mshd5aa02a0558e374p164099jsn355af2542355'
```

```json
{
  "vl": 798.799071,
  "ts": 1602732041
}
```

### UF (GET: https://mindicador.cl/api/uf/dd-mm-YYYY)

```
curl --request GET \
	--url 'https://mindicador.cl/api/uf/15-10-2020'
```

```json
{
    "version": "1.6.0",
    "autor": "mindicador.cl",
    "codigo": "uf",
    "nombre": "Unidad de fomento (UF)",
    "unidad_medida": "Pesos",
    "serie": [
        {
            "fecha": "2020-10-15T03:00:00.000Z",
            "valor": 28749.73
        }
    ]
}
```

### UTM (GET: https://mindicador.cl/api/utm/dd-mm-YYYY)

```
curl --request GET \
	--url 'https://mindicador.cl/api/utm/15-10-2020'
```

```json
{
    "apiVersion": "1.0",
    "utm": {
        "valor": 50.372,
        "fecha": "2020-05-01"
    },
    "timestamp": 1588655152889
}
```

## Información importante

* Disponibilizar entrega en Git personal
* Crear archivo README.md en raiz del directorio git con documentación de como probar el desarrollo.
* Puntos importantes que serán revisados y bien considerados en la entrega:
 * Buen uso de log (info, error, debug)
 * Codigo ordenado
 * Manejo de reintentos
 * Manejo de timeout en invocacion de servicios
 * Incluir Pruebas Unitarias