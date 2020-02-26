var defaults = {
    preloaded: [],
    imagesInputName: 'images',
    preloadedInputName: 'preloaded',
    label: 'You can also drop image files here to upload them'
};

var dataTransfer = new DataTransfer();
var $container = $('.image-uploader');
var $input = $('#images-select');
var $inputBtn = $('#selectBtn');

$container.on("dragover", fileDragHover.bind($container));
$container.on("dragleave", fileDragHover.bind($container));
$container.on("drop", fileSelectHandler.bind($container));

$input.on("click", function (e) {
    e.stopPropagation();
});

$inputBtn.on('click', function (e) {
    // Prevent browser default event and stop propagation
    prevent(e);
    // Trigger input click
    $input.trigger('click');
});

// Listen to input files changed
$input.on('change', fileSelectHandler.bind($container));

function prevent(e) {
    // Prevent browser default event and stop propagation
    e.preventDefault();
    e.stopPropagation();
}

function createImg(src, id) {
    // Create the upladed image container
    var $container = $('<div>', {class: 'uploaded-image item'}),

        // Create the img tag
        $img = $('<img>', {src: src, class: '0'}).appendTo($container),
        // Create the delete button
        $button = $('<button>', {class: 'delete-image'}).appendTo($container),

        // Create the delete icon
        $i = $('<i>', {class: 'material-icons', text: 'clear'}).appendTo($button),

        $edit_buttons = $('<div>', {class: 'edit_buttons'}).appendTo($container),
        $leftRotate = $('<button>', {class: 'left-rotate'}).appendTo($edit_buttons),
        $leftIcon = $('<i>', {class: 'material-icons', text: 'rotate_left'}).appendTo($leftRotate),
        
        $crop = $('<button>', {class: 'crop'}).appendTo($edit_buttons),
        $cropIcon = $('<i>', {class: 'material-icons', text: 'crop'}).appendTo($crop),
        
        $rightRotate = $('<button>', {class: 'right-rotate'}).appendTo($edit_buttons),
        $rightIcon = $('<i>', {class: 'material-icons', text: 'rotate_right'}).appendTo($rightRotate),

        $modal = $('<div>', {class: 'modal'}).appendTo($container),
        $modal_dialog = $('<div>', {class: 'modal-dialog'}).appendTo($modal),
        $modal_content = $('<div>', {class: 'modal-content'}).appendTo($modal_dialog),
        $modal_body = $('<div>', {class: 'modal-body'}).appendTo($modal_content),
        $croppedImg = $('<img>', {class: 'croppedImg'}).appendTo($modal_body),
        $modal_footer = $('<div>', {class: 'modal-footer'}).appendTo($modal_content),
        $cropBtn = $('<button>', {class: 'btn btn-success', text: 'Crop'}).appendTo($modal_footer),
        $cancelBtn = $('<button>', {class: 'btn btn-danger', text: 'Cancel'}).appendTo($modal_footer);

    $container.attr('data-index', id);

    // Set delete action
    $button.on("click", function (e) {
        // Prevent browser default event and stop propagation
        prevent(e);

        // If is not a preloaded image
        if ($container.data('index')) {

            // Get the image index
            let index = parseInt($container.data('index'));

            // Update other indexes
            $container.find('.uploaded-image[data-index]').each(function (i, cont) {
                if (i > index) {
                    $(cont).attr('data-index', i - 1);
                }
            });

            // Remove the file from input
            dataTransfer.items.remove(index);
        }

        // Remove this image from the container
        $container.remove();

        // If there is no more uploaded files
        if (!$container.find('.uploaded-image').length) {

            // Remove the 'has-files' class
            $container.removeClass('has-files');

        }

    });

    $leftRotate.on('click', function(e) {
        prevent(e);
        var original = $img.attr('class');
        $img.attr('class', parseInt(original) - 1);
        var deg = 90 * (parseInt(original) - 1);
        console.log(deg);
        $img.css('transform', 'rotate('+deg+'deg)');
        adjustImg(original, $img);
    });

    $rightRotate.on('click', function(e) {
        prevent(e);
        var original = $img.attr('class');
        $img.attr('class', parseInt(original) + 1);
        var deg = 90 * (parseInt(original) + 1);
        console.log(deg);
        $img.css('transform', 'rotate('+deg+'deg)');
        adjustImg(original, $img);
    });

    $crop.on('click', function(e) {
        $modal.modal('show');
        $croppedImg.attr('src', $img.attr('src'));

        var cropper = new Cropper($croppedImg[0], {
            aspectRatio: 4 / 3,
            crop: function(e) {
                console.log(e.detail.x);
                console.log(e.detail.y);
            }
        });

        $cropBtn.on('click', function(e) {
            var imgurl = cropper.getCroppedCanvas().toDataURL();
            $img.attr('src', imgurl);
            $modal.modal('hide');
        });

        $cancelBtn.on('click', function(e){
            $modal.modal('hide');
        });

        $modal.on('hiden.bs.modal', function(e) {
            console.log('Modal hidden');
            cropper.destroy();
        });
    });

    return $container;
}

function fileDragHover(e) {
    // Prevent browser default event and stop propagation
    prevent(e);

    // Change the container style
    if (e.type === "dragover") {
        $(this).addClass('drag-over');
    } else {
        $(this).removeClass('drag-over');
    }
}

function fileSelectHandler(e) {
    // Prevent browser default event and stop propagation
    prevent(e);

    // Get the jQuery element instance
    var $container = $(this);

    // Change the container style
    $container.removeClass('drag-over');

    // Get the files
    var files = e.target.files || e.originalEvent.dataTransfer.files;

    // Makes the upload
    setPreview($container, files);
}

function setPreview($container, files) {
    // Add the 'has-files' class
    $container.addClass('has-files');

    // Get the upload images container
    var $uploadedContainer = $('.uploaded'),
    // let $uploadedContainer = $container.find('.uploaded'),

        // Get the files input
    $input = $container.find('input[type="file"]');

    // Run through the files
    $(files).each(function (i, file) {

        // Add it to data transfer
        dataTransfer.items.add(file);

        // Set preview
        $uploadedContainer.append(createImg(URL.createObjectURL(file), dataTransfer.items.length - 1));

    });

    // Update input files
    $input.prop('files', dataTransfer.files);
}

function adjustImg(original, $img) {
    var height = $img[0].parentNode.offsetHeight;
    var width = $img[0].parentNode.offsetWidth;
    var ratio = $img.height() / $img.width();
    var top = (height - ratio * height) / 2 - 1;

    if(original % 2 == 0){
        $img.width(height);
        $img.height(ratio * height);
        $img.css('top', top+'px');
    }
    else
    {
        $img.height(height);
        $img.width(height / ratio);
        $img.css('top', '0');
    }
}