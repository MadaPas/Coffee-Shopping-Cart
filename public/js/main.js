// textarea delete text
$(function() {
  if ($("textarea#ta").length) {
    CKEDITOR.replace("ta");
  }

  $("a.confirmDeletion").on("click", () => {
    if (!confirm("Confirm Deletion")) return false;
  });

  if ($("[data-fancybox]").length) {
    $("[data-fancybox]").fancybox();
  }
});

//image settings

document.querySelector("#img").addEventListener("change", function() {
  // user selected file
  var file = this.files[0];
  if (file == undefined) {
    _PREVIEW_URL = "#";
  } else {
    // validate file size
    if (file.size > 2 * 1024 * 1024) {
      alert("Error : Exceeded size 2MB");
      return;
    }

    // validation is successful

    // object url
    _PREVIEW_URL = URL.createObjectURL(file);
  }

  // set src of image and show
  document.querySelector("#imgPreview").setAttribute("src", _PREVIEW_URL);
  document.querySelector("#imgPreview").style.display = "inline-block";
});
