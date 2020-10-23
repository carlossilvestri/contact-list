// =====================
//      Variables
// =====================
const inputSearch = document.querySelector('#search');
const deleteContactBtn = document.querySelectorAll(".delete-contact");
// =====================
// When the page is loaded.
// =====================
document.addEventListener("DOMContentLoaded", () => {
    //Revisar que existen los formularios
    if (deleteContactBtn.length > 0) {
        deleteContactBtn.forEach(buttonDelete => {
            buttonDelete.addEventListener('click', deleteContact);
        });
    }
    // Search contact
    if (inputSearch) {
        inputSearch.addEventListener('input', searchContact);
    }
});
// =====================
//      Functions
// =====================
function deleteContact(e) {
    e.preventDefault();

    Swal.fire({
        title: 'Delete contact',
        text: "You won't be able to recover this contact",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete.',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.value) {
            const idContact = $(this).data('id');
            axios.get(`/delete-contact/${idContact}`)
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        Swal.fire(
                            'Good job!',
                            'Contact was deleted!',
                            'success'
                        );
                        location.reload();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!'
                    })
                })
                .then(function () {
                    // always executed
                });

        }
    });



}
/*
=====================
Function: searchContact. Params: e (event of the browser).
This function hide or show a contact each time there's an input event in the inputSearch bar.
===================== 
*/
function searchContact(e) {
    const expresion = new RegExp(e.target.value, "i"),
        registros = document.querySelectorAll('tbody tr');
    registros.forEach(registro => {
        registro.style.display = 'none';
        // /\s/g es un espacio en blanco en Expresiones Regulares
        if (registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1) {
            //Como es una tabla se debe cambiar por table-row.
            registro.style.display = 'table-row';
        }
        numberOfContacts();
    })
}
/*
=====================
Function: numberOfContacts. Params: None.
This function counts and shows the number of contacts found.
===================== 
*/
function numberOfContacts() {
    const totalContactos = document.querySelectorAll('tbody tr'),
        contenedorNumero = document.querySelector('.total-contactos span');
    let total = 0;

    totalContactos.forEach(contacto => {
        if (contacto.style.display === '' || contacto.style.display === 'table-row') {
            total++;
        }
    });

    //Contenedor 
    contenedorNumero.textContent = total;

}