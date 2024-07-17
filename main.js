// Variables y constantes
let preguntas = [];
let preguntas_actuales_puntaje = 0;
let puntaje = 0;
let respuesta_seleccionada = false;
const total_preguntas = 10; 
const apiKey = '211fa4ae3cb4429981c86dc5a8f2da0d';

// Elementos del DOM
const pregunta_element = document.getElementById('pregunta');
const respuesta_element = document.getElementById('respuestas');
const sig_boton = document.getElementById('sig-boton');
const reset_boton = document.createElement('boton');
reset_boton.textContent = 'Reiniciar Trivial';
reset_boton.addEventListener('click', reset_trivial);
reset_boton.style.display = 'none'; 
document.getElementById('contenedor--trivial').appendChild(reset_boton);

// Funcion fetch
async function fetch_preguntas() {
    try {
        const response = await fetch('pregtrivial.json');
        if (!response.ok) {
            throw new Error('La reacción de red no ha ido bien ' + response.statusText);
        }
        const data = await response.json();

        preguntas = data.slice(0, 20).map(async item => {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${item.id_pelicula}?api_key=${apiKey}&language=es`);
            if (!response.ok) {
                throw new Error('La respuesta de red no fue exitosa ' + response.statusText);
            }
            const movieData = await response.json();
            const imagen = movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null;

            return {
                pregunta: item.pregunta,
                id_pelicula: item.id_pelicula,
                imagen: imagen,
                respuestas: array_barajar([
                    ...item.incorrect_answers.map(respuesta => ({ text: respuesta, correct: false })),
                    { text: item.correct_answer, correct: true }    
                ])
            };
        });

        preguntas = await Promise.all(preguntas);
        preguntas = array_barajar(preguntas); 
        empezar_trivial();
    } catch (error) {
        console.error('Error de fetch: ', error);
    }
    
}

// Funciones
function array_barajar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function empezar_trivial() {
    muestreo_pregunta();
}

function muestreo_pregunta() {
    const pregunta_actual = preguntas[preguntas_actuales_puntaje];
    pregunta_element.textContent = pregunta_actual.pregunta;
    respuesta_element.innerHTML = '';

    if (pregunta_actual.imagen) {
        const imagen_element = document.createElement('img');
        imagen_element.src = pregunta_actual.imagen;
        imagen_element.alt = 'Imagen de la película';
        respuesta_element.appendChild(imagen_element);
    }

    pregunta_actual.respuestas.forEach(respuesta => {
        const boton = document.createElement('button');
        boton.textContent = respuesta.text;
        boton.classList.add('respuesta-boton');
        boton.addEventListener('click', () => elige_respuesta(respuesta));
        respuesta_element.appendChild(boton);
    });

    sig_boton.disabled = true;
}

function elige_respuesta(respuesta) {
    if (respuesta_seleccionada) return; 

    respuesta_seleccionada = true;

    if (respuesta.correct) {
        
        muestra_feedback(true);
        puntaje++;
    } else {
        
        muestra_feedback(false);
    }

    sig_boton.disabled = false;
}

function muestra_feedback(correct) {
    const feedback_element = document.createElement('p');
    feedback_element.textContent = correct ? '¡Correcto!' : 'Incorrecto';
    feedback_element.classList.add(correct ? 'correct-feedback' : 'incorrect-feedback');
    respuesta_element.appendChild(feedback_element);
}

function sig_pregunta() {
    respuesta_seleccionada = false; 
    preguntas_actuales_puntaje++;

    if (preguntas_actuales_puntaje < total_preguntas) {
        muestreo_pregunta();
    } else {
        
        muestra_finpantalla();
    }
}

function muestra_finpantalla() {
    pregunta_element.textContent = '¡Trivial terminado!';
    respuesta_element.innerHTML = `<p>Tu puntaje es: ${puntaje} / ${total_preguntas}</p>`;
    sig_boton.style.display = 'none';
    reset_boton.style.display = 'inline-block';
}

function reset_trivial() {
    preguntas_actuales_puntaje = 0;
    puntaje = 0;
    respuesta_seleccionada = false;
    reset_boton.style.display = 'none';
    sig_boton.style.display = 'inline-block';
    fetch_preguntas();
}

// Reinicio trivial + fetch de preguntas
fetch_preguntas();
