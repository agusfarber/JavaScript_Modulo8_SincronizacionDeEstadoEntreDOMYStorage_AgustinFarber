// Simulador de promedio de notas - Pre-Entrega 8
// El listado vive en memoria y se sincroniza con localStorage

const NOTA_MINIMA = 0
const NOTA_MAXIMA = 10
const NOTA_APROBACION = 6
const CLAVE_ALUMNOS = "alumnos"

class Alumno {
  constructor(id, nombre, curso, notas) {
    this.id = id
    this.nombre = nombre
    this.curso = curso
    this.notas = notas
  }

  agregarNota(nota) {
    this.notas.push(nota)
  }

  calcularPromedio() {
    if (this.notas.length === 0) {
      return 0
    }

    const sumaNotas = this.notas.reduce((acumulador, nota) => acumulador + nota, 0)
    return sumaNotas / this.notas.length
  }

  obtenerCalificacion() {
    const promedio = this.calcularPromedio()

    return promedio >= 9
      ? "Excelente"
      : promedio >= NOTA_APROBACION
        ? "Aprobado"
        : "Desaprobado"
  }
}

const materias = [
  "Matemática",
  "Lengua",
  "Historia",
  "Inglés",
  "Programación",
]

const alumnosBase = [
  { id: 1, nombre: "Ana Pérez", curso: "1°A", notas: [8, 9, 7] },
  { id: 2, nombre: "Pedro Gómez", curso: "1°A", notas: [5, 6, 4] },
  { id: 3, nombre: "Lucía Díaz", curso: "1°B", notas: [10, 9, 8] },
  { id: 4, nombre: "Martín Soto", curso: "1°B", notas: [6, 6, 7] },
  { id: 5, nombre: "Sofía Ruiz", curso: "1°A", notas: [3, 4, 5] },
]

let textoBusqueda = ""
let filtroCurso = "todos"
let idDestacado = null

const inputNombre = document.getElementById("input-nombre")
const inputCurso = document.getElementById("input-curso")
const inputNota = document.getElementById("input-nota")
const btnAgregar = document.getElementById("btn-agregar")
const btnVaciar = document.getElementById("btn-vaciar")
const inputBusqueda = document.querySelector("#input-busqueda")
const formulario = document.querySelector("#formulario-alumno")
const contenedorAlumnos = document.querySelector("#contenedor-alumnos")
const filtrosCurso = document.querySelector("#filtros-curso")
const aviso = document.getElementById("aviso")

function crearAlumno(dato) {
  const { id, nombre, curso } = dato ?? {}
  const notas = Array.isArray(dato?.notas) ? [...dato.notas] : []

  return new Alumno(id, nombre ?? "Sin nombre", curso ?? "Sin curso", notas)
}

function cargarAlumnos() {
  try {
    const datosGuardados = JSON.parse(localStorage.getItem(CLAVE_ALUMNOS)) || alumnosBase
    return datosGuardados.map((dato) => crearAlumno(dato))
  } catch {
    return alumnosBase.map((dato) => crearAlumno(dato))
  }
}

const alumnos = cargarAlumnos()

function guardarAlumnos() {
  const datos = alumnos.map(({ id, nombre, curso, notas }) => ({
    id,
    nombre,
    curso,
    notas: [...notas],
  }))

  localStorage.setItem(CLAVE_ALUMNOS, JSON.stringify(datos))
}

if (localStorage.getItem(CLAVE_ALUMNOS) === null) {
  guardarAlumnos()
}

const esNotaValida = (nota) => {
  return !isNaN(nota) && nota >= NOTA_MINIMA && nota <= NOTA_MAXIMA
}

function crearFiltroPorCurso(cursoBuscado) {
  const cursoNormalizado = cursoBuscado.toLowerCase()
  return (alumno) => alumno.curso.toLowerCase() === cursoNormalizado
}

function escaparHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function claseEstado(calificacion) {
  return calificacion === "Excelente"
    ? "excelente"
    : calificacion === "Aprobado"
      ? "aprobado"
      : "desaprobado"
}

function mostrarFeedback(mensaje, tipo) {
  aviso.textContent = mensaje
  aviso.className = "aviso aviso-" + tipo
}

function obtenerAlumnosVisibles() {
  let lista = alumnos

  if (filtroCurso !== "todos") {
    lista = lista.filter(crearFiltroPorCurso(filtroCurso))
  }

  const busqueda = textoBusqueda.trim().toLowerCase()

  if (busqueda !== "") {
    lista = lista.filter((alumno) =>
      alumno.nombre.toLowerCase().includes(busqueda)
    )
  }

  return lista
}

function renderizarMaterias() {
  const elementoMaterias = document.querySelector("#materias")
  elementoMaterias.textContent = "Materias: " + materias.join(" · ")
}

function renderizarResumen() {
  const total = document.getElementById("total-alumnos")
  const promedioGeneral = document.getElementById("promedio-general")
  const desaprobados = document.getElementById("total-desaprobados")

  total.textContent = alumnos.length

  const sumaPromedios = alumnos.reduce(
    (acumulador, alumno) => acumulador + alumno.calcularPromedio(),
    0
  )

  promedioGeneral.textContent =
    alumnos.length === 0 ? "0.00" : (sumaPromedios / alumnos.length).toFixed(2)

  const cantidadDesaprobados = alumnos.filter(
    (alumno) => alumno.obtenerCalificacion() === "Desaprobado"
  ).length
  desaprobados.textContent = cantidadDesaprobados
}

function renderizarFiltros() {
  const cursos = []

  alumnos.forEach((alumno) => {
    const yaExiste = cursos.some(
      (curso) => curso.toLowerCase() === alumno.curso.toLowerCase()
    )

    if (!yaExiste) {
      cursos.push(alumno.curso)
    }
  })

  const cursoSigueExistiendo = cursos.some(
    (curso) => curso.toLowerCase() === filtroCurso.toLowerCase()
  )

  if (filtroCurso !== "todos" && !cursoSigueExistiendo) {
    filtroCurso = "todos"
  }

  let htmlFiltros =
    `<button type="button" class="filtro${filtroCurso === "todos" ? " activo" : ""}" data-curso="todos">Todos</button>`

  cursos.forEach((curso) => {
    const activo =
      filtroCurso.toLowerCase() === curso.toLowerCase() ? " activo" : ""
    htmlFiltros +=
      `<button type="button" class="filtro${activo}" data-curso="${escaparHtml(curso)}">${escaparHtml(curso)}</button>`
  })

  filtrosCurso.innerHTML = htmlFiltros
}

function renderizarAlumnos() {
  const visibles = obtenerAlumnosVisibles()

  if (visibles.length === 0) {
    contenedorAlumnos.innerHTML =
      `<p class="vacio">No hay alumnos para mostrar con ese filtro.</p>`
    renderizarResumen()
    return
  }

  const htmlTarjetas = visibles
    .map((alumno) => {
      const { id, nombre, curso, notas } = alumno
      const calificacion = alumno.obtenerCalificacion()
      const notasTexto = notas.length === 0 ? "Sin notas" : notas.join(", ")
      const destacada = id === idDestacado ? " tarjeta-nueva" : ""

      return `
        <article class="tarjeta${destacada}">
          <div>
            <h3>${escaparHtml(nombre)}</h3>
            <p>Curso: ${escaparHtml(curso)}</p>
            <p>Notas: ${escaparHtml(notasTexto)}</p>
            <p>Promedio: ${alumno.calcularPromedio().toFixed(2)}</p>
          </div>
          <span class="estado estado-${claseEstado(calificacion)}">${calificacion}</span>
          <div class="tarjeta-acciones">
            <input class="input-nota" type="number" min="0" max="10" step="0.1" placeholder="Nueva nota" aria-label="Nueva nota de ${escaparHtml(nombre)}" />
            <button type="button" class="btn-nota" data-id="${id}">Cargar nota</button>
            <button type="button" class="btn-eliminar" data-id="${id}">Eliminar</button>
          </div>
        </article>
      `
    })
    .join("")

  contenedorAlumnos.innerHTML = htmlTarjetas
  renderizarResumen()
}

function actualizarVista() {
  renderizarFiltros()
  renderizarAlumnos()
}

function agregarAlumno() {
  const nombre = inputNombre.value.trim()
  const curso = inputCurso.value.trim()
  const notaTexto = inputNota.value.trim()

  if (nombre === "" || curso === "") {
    mostrarFeedback("Completá el nombre y el curso para agregar un alumno.", "error")
    return
  }

  const notas = []

  if (notaTexto !== "") {
    const nota = Number(notaTexto)

    if (!esNotaValida(nota)) {
      mostrarFeedback("La nota inicial tiene que ser un número entre 0 y 10.", "error")
      return
    }

    notas.push(nota)
  }

  const nuevoId =
    alumnos.reduce((maximo, alumno) => Math.max(maximo, alumno.id), 0) + 1
  const nuevoAlumno = new Alumno(nuevoId, nombre, curso, notas)

  alumnos.push(nuevoAlumno)
  idDestacado = nuevoId
  inputNombre.value = ""
  inputCurso.value = ""
  inputNota.value = ""

  guardarAlumnos()
  mostrarFeedback(nombre + " se agregó al listado.", "ok")
  actualizarVista()
}

function cargarNota(id, notaTexto) {
  const alumno = alumnos.find((item) => item.id === id)

  if (!alumno) {
    mostrarFeedback("No se encontró el alumno para cargar la nota.", "error")
    return
  }

  const nota = Number(notaTexto)

  if ((notaTexto ?? "").trim() === "" || !esNotaValida(nota)) {
    mostrarFeedback("Ingresá una nota entre 0 y 10.", "error")
    return
  }

  alumno.agregarNota(nota)
  idDestacado = alumno.id

  const { nombre } = alumno
  const promedio = alumno.calcularPromedio().toFixed(2)
  const calificacion = alumno.obtenerCalificacion()

  guardarAlumnos()
  mostrarFeedback(
    "Nota " +
      nota +
      " cargada a " +
      nombre +
      ". Promedio: " +
      promedio +
      " (" +
      calificacion +
      ").",
    "ok"
  )
  actualizarVista()
}

function eliminarAlumno(id) {
  const indice = alumnos.findIndex((alumno) => alumno.id === id)

  if (indice === -1) {
    mostrarFeedback("No se encontró el alumno para eliminar.", "error")
    return
  }

  const { nombre } = alumnos[indice]
  alumnos.splice(indice, 1)
  idDestacado = null

  guardarAlumnos()
  mostrarFeedback(nombre + " se eliminó del listado.", "ok")
  actualizarVista()
}

function vaciarListado() {
  alumnos.splice(0, alumnos.length)
  localStorage.removeItem(CLAVE_ALUMNOS)
  guardarAlumnos()

  filtroCurso = "todos"
  textoBusqueda = ""
  inputBusqueda.value = ""
  idDestacado = null

  mostrarFeedback("Se vació el listado y el almacenamiento.", "ok")
  actualizarVista()
}

btnAgregar.addEventListener("click", agregarAlumno)
btnVaciar.addEventListener("click", vaciarListado)

formulario.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault()
    agregarAlumno()
  }
})

inputBusqueda.addEventListener("keyup", (event) => {
  textoBusqueda = event.target.value
  idDestacado = null
  renderizarAlumnos()
})

inputBusqueda.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    inputBusqueda.value = ""
    textoBusqueda = ""
    renderizarAlumnos()
    mostrarFeedback("Se limpió la búsqueda.", "ok")
  }
})

filtrosCurso.addEventListener("click", (event) => {
  const boton = event.target.closest("button")

  if (!boton) {
    return
  }

  filtroCurso = boton.dataset.curso
  idDestacado = null
  renderizarFiltros()
  renderizarAlumnos()
})

contenedorAlumnos.addEventListener("click", (event) => {
  const botonNota = event.target.closest(".btn-nota")
  const botonEliminar = event.target.closest(".btn-eliminar")

  if (botonNota) {
    const tarjeta = botonNota.closest(".tarjeta")
    const notaTexto = tarjeta?.querySelector(".input-nota")?.value ?? ""
    cargarNota(Number(botonNota.dataset.id), notaTexto)
  }

  if (botonEliminar) {
    eliminarAlumno(Number(botonEliminar.dataset.id))
  }
})

renderizarMaterias()
actualizarVista()
