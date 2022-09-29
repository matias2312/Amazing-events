let queryString = location.search
let id = new URLSearchParams(queryString).get("id")  
const app = Vue.
createApp({
    data() {
        return {
            events : [],
            eventsGuardados : [],
            nombre: "",
            categorias : [],
            categoriasSeleccionadas: [],
            pastEvents : [],
            upEvents : [],
            eventoid:[],
            tablacapacity:[],
            tablaPorcentaje: [],
            tablaUp: [],
            tablaPast:[],
            funciona:[],
            lowest: [],
            highest:[],
            fecha:"",
            eventoMasCapacidad: [],
            eventoMayorPorcentaje: [],
            eventoMenorPorcentaje: [],
        }
        
    },

    created(){

        fetch("https://amazing-events.herokuapp.com/api/events")
            .then(response => response.json())
            .then((json) => {
                this.events = json.events;
                this.fecha = json.currentDate;

                if (document.title == "Upcoming Events") {
                    this.events = this.events.filter((event)=> event.date > json.currentDate)
                }else if(document.title == "Past Events"){
                    this.events = this.events.filter((event)=> event.date < json.currentDate)
                }else if(document.title == "Details"){
                    this.eventoid = this.events.find(event => event._id == id) 
                }

                this.upEvents = this.events.filter((event)=> event.date > json.currentDate)
                this.pastEvents = this.events.filter((event)=> event.date < json.currentDate)
                this.tablaUp = this.calculadora(this.upEvents)
                this.tablaPast = this.calculadora(this.pastEvents)
                this.eventsGuardados = this.events;
                
                this.conseguirMayorCapacidad();
                this.conseguirAsistencias(this.events.filter(evento => evento.date < this.fecha));              
                this.obtenerCategorias()
                

        })
        .catch((error) => console.log(error))
    },

    methods: {
        filtrarPorNombre(events){
            this.events = events.filter(event => event.name.toLowerCase().includes(this.nombre.toLowerCase()))
        },

        obtenerCategorias(){
            this.categorias = this.events.map(event => event.category)
            console.log(this.categorias)
            this.categorias = new Set(this.categorias)
        },

        calculadora(array) {
            let arraysinduplicados = []
            array.forEach(evento => {
                if (!arraysinduplicados.includes(evento.category)) {
                    arraysinduplicados.push(evento.category)
                }})                
                let arraycalculos = []
                    arraysinduplicados.forEach(category => {
                        let categoriasAgrupadas = array.filter(events => events.category == category)
                        let ingresos = categoriasAgrupadas.map(events => (events.estimate? events.estimate : events.assistance) * events.price)
                        let totalIngresos = ingresos.reduce((a, b) => a = a + b, 0)
                        let porcentaje = categoriasAgrupadas.map(events =>((events.estimate? events.estimate : events.assistance) / events.capacity))
                        let totalPorcentaje = porcentaje.reduce((a, b) => a = a + b, 0);
                        arraycalculos.push([category, totalIngresos, parseInt(totalPorcentaje / categoriasAgrupadas.length*100)])
                    })
                    return arraycalculos
        },

        conseguirMayorCapacidad(){
            let capacidades = this.events.map(event => event.capacity)
            this.eventoMasCapacidad = this.events.find(event => event.capacity == Math.max(...capacidades))
        },

        conseguirAsistencias(eventosPasados){
            let asistencias = eventosPasados.map(event => event.assistance / event.capacity)
            this.eventoMayorPorcentaje = eventosPasados.find(event => event.assistance / event.capacity == Math.max(...asistencias))
            this.eventoMenorPorcentaje = eventosPasados.find(event => event.assistance / event.capacity == Math.min(...asistencias))
        },
    },

    computed: {
        buscador(){
            if(this.categoriasSeleccionadas.length !=0){
                this.events= this.events.filter(event => {
                    return this.categoriasSeleccionadas.includes(event.category)
                })
            }else{
                this.events = this.eventsGuardados
            }
            if(this.nombre !=''){
                this.filtrarPorNombre(this.events)
            }
        },
     
    }
}).mount('#app')