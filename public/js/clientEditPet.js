//parses specific part of URL or ID for specific pet to get data from db
const urlVariables = new URLSearchParams(window.location.search);
const id = urlVariables.get("id");

async function getEditPet() {
  const ourPromise = await fetch("/.netlify/functions/getSinglePet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    //id: id equivalent to id
    body: JSON.stringify({ id }),
  });

  const pet = await ourPromise.json();
  console.log(pet);

  if (!pet.name) {
    window.location = "/admin";
  }

  document.querySelector("#name").value = pet.name;
  document.querySelector("#birthYear").value = pet.birthYear;
  document.querySelector("#species").value = pet.species;
  document.querySelector("#description").value = pet.description;

  //image preview
  if (pet.photo) {
    document.querySelector("#photo-preview").innerHTML = `<img
    src="https://res.cloudinary.com/dysnlfeaw/image/upload/w_190,h_190,c_fill/${pet.photo}.jpg"/>`;
  }

  //removes loading screen and focuses name field once data has been entered
  document.querySelector("#edit-pet-form").classList.remove("form-is-loading");
  document.querySelector("#name").focus();
}

getEditPet();

document
  .querySelector("#edit-pet-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    //form lock check
    if (isFormLocked) {
      //null will prevent function from running
      return null;
    }

    isFormLocked = true;

    const pet = {
      id,
      name: document.querySelector("#name").value,
      birthYear: document.querySelector("#birthYear").value,
      species: document.querySelector("#species").value,
      description: document.querySelector("#description").value,
    };

    if (cloudinaryReturnedObject) {
      pet.public_id = cloudinaryReturnedObject.public_id;
      pet.version = cloudinaryReturnedObject.version;
      pet.signature = cloudinaryReturnedObject.signature;
    }

    document.querySelector("#edit-pet-form").classList.add("form-is-loading");

    const ourPromise = await fetch("/.netlify/functions/saveChanges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pet),
    });

    const response = await ourPromise.json();

    //redirects to admin if edit pet is successful
    if (response.success) {
      window.location = "/admin";
    }
  });
