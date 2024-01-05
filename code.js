var colors = [
  '#FFFD54',
  '#E08AE8',
  '#75140C',
  '#73FBFD',
  '#EB3323',
  '#73DDD0',
  '#367E7F',
  '#EA3EF7',
  '#78A65A',
  '#E06666',
  '#000000',
  '#807F26',
  '#000B7B',
  '#0021F5',
  '#8B2CF5',
  '#43117D',
  '#FFF2CC',
  '#CDB591',
  '#D16D6A',
  '#F29D39',
  '#A0FCD7',
  '#F6C3CB',
  '#C0C0C0',
  '#666666',
  '#75FA4C',
  '#9FC6E8',
];

$(document).ready(function() {
  $('body').bootstrapMaterialDesign();
  setColors(colors);
});

function setColors(colors) {
  $('#list-colors').empty();
  fillColors('#list-colors', colors);
  setColorsTxt('#txt-colors', colors);
  currentColor = -1;
}

let draw = SVG('drawing').size(100, 100);
$('#int-original-width').val(100);
$('#int-original-height').val(100);
let shapes;

$('#list-colors').on('click', 'span', function(evt) {
  currentColor = $(this).index();
  setCurrentBorder($(this));
  joe.set(this.dataset.color);
  $('#color-picker').show();
  joe.show();
});

$('#btn-mask').on('click', function(evt) {
  $('#btn-mask').hide();
  $('#uploadForm').show();
});

$('#txt-colors').on('blur', function(evt){
  currentColor = -1;
  colors = $('#txt-colors').val().split('\n');
  $('#list-colors').empty();
  fillColors('#list-colors', colors);
});

$('#btn-update').on('click', function(evt) {
  /*
    '#a00', '#b00', '#c00', '#d00', '#f00',
    '#a10', '#b10', '#c10', '#d10', '#f10',

    '#a20', '#b20', '#c20', '#d20', '#f20',
    '#a30', '#b30', '#c30', '#d30', '#f30',

    '#a40', '#b40', '#c40', '#d40', '#f40',
    '#a50', '#b50', '#c50', '#d50', '#f50',
    '#a60', '#b60', '#c60', '#d60', '#f60',
    '#a70', '#b70', '#c70', '#d70', '#f70',
    '#a80', '#b80', '#c80', '#d80', '#f80',
    '#a90', '#b90', '#c90', '#d90', '#f90',
    '#aa0', '#ba0', '#ca0', '#da0', '#fa0',
    '#ab0', '#bb0', '#cb0', '#db0', '#fb0',
    '#ac0', '#bc0', '#cc0', '#dc0', '#fc0',
  */
  doUpdate();
});

function doUpdate() {
  $('#i-loading').show();
  $('.progress').width('0%');
  $('.progress').css('visibility', 'visible');
  setTimeout(function(){
    updateShapes(draw);
    $('.progress').css('visibility', 'hidden');
    $('.progress').width('0%');
    $('#i-loading').hide();
  }, 100);
}

$('input[name=shape]').on('input', function() {
  doUpdate();
});

$('#int-width').on('input', function() {
  doUpdate();
});

$('#int-height').on('input', function() {
  doUpdate();
});

$('#int-lines').on('input', function() {
  doUpdate();
});

$('#int-columns').on('input', function() {
  doUpdate();
});

$('#int-space').on('input', function() {
  doUpdate();
});

function getText(id) {
  return $(id).val().replace(/\s/g, '');
}

function updateShapes(draw) {
  let palette = $('#txt-colors').val().split('\n');

  let colors = getColors(getText('#txt-content'), palette);
  if (colors.length > 1000) {
    $('#auto-refresh').prop('checked', false);
    $('#show-preview').prop('checked', false);
    return;
  }
  let sqrt = Math.sqrt(colors.length);

  //let width = 100;
  let width = parseInt($('#int-width').val());
  //let height = 10;
  let height = parseInt($('#int-height').val());

  let lines, columns;
  let linesVal = $('#int-lines').val();
  lines = parseInt(linesVal);
  let columnsVal = $('#int-columns').val();
  columns = parseInt(columnsVal);
  if (isNaN(columns) || columns == 0) {
    if (isNaN(lines) || lines == 0) {
      columns = Math.ceil(sqrt);
      lines = columns;
    } else {
      columns = Math.max(Math.ceil(colors.length / lines), 1);
    }
  } else if (isNaN(lines) || lines == 0) {
    lines = Math.max(Math.ceil(colors.length / columns), 1);
  }

  let space = 0, spaceVal = $('#int-space').val();
  space = parseInt(spaceVal);

  let shape = $('input[name=shape]:checked').val();

  let overlap = $('#chk-overlap').is(':checked');

  draw.clear();

  let totalHeight, totalWidth;
  if (overlap) {
    totalHeight = height + colors.length * space;
    totalWidth = width + colors.length * space;
  } else {
    totalHeight = (height+space)*lines;
    totalWidth = (width+space)*columns;
  }

  $('#int-original-width').val(totalWidth);
  $('#int-original-height').val(totalHeight);
  let d = draw.size(totalWidth, totalHeight).group();

  let imageUrl = $('#txt-image').val();
  let fileDetails = getFileDetails();

  let image, mask;

  if (fileDetails['name']) {
    imageUrl = 'files/'+fileDetails['name'];
  }

  if (imageUrl) {
    image = draw.image(imageUrl, totalWidth, totalHeight);
  }

  if (image) {
    mask = draw.mask().add(image);
    d.maskWith(mask);
  }

  let drawingOps = new Array();

  switch(shape) {
    case 'rect':
      drawingOps = [
      (i, j, lines, d, space, width, height) => d
        .rect(width, height)
        //.move((i%columns)*(width+space), j * (height + space))
      ];
      shapes = drawShapes(d, mask, space, width, height, colors, lines, columns, overlap, drawingOps);
    break;

    case 'circle':
      drawingOps = [
      (i, j, lines, d, space, width, height) => d
        .ellipse(width, height)
        //.move((i%columns)*(width+space), j * (height + space))
      ];
      shapes = drawShapes(d, mask, space, width, height, colors, lines, columns, overlap, drawingOps);
    break;

    case 'triangle':
      drawingOps = [
        (i, j, lines, d, space, width, height) => d
          .polygon([0, 0, width, 0, width/2, height])
          //.move((i%columns) * (width + space), j * (height + space)),
        /*(i, j, lines, d, width, height) => d
          .polygon([0, height, width, height, width/2, 0])
          .move(j * width, (i%lines) * height)*/
      ];
      shapes = drawShapes(d, mask, space, width, height, colors, lines, columns, overlap, drawingOps);
    break;
  }

  let zoom = parseInt($('#int-zoom').val());

  resizeShapes(shapes, zoom);
}

function mod(x, n) {
  if (x < 0) {
    x = -x;
  }
  return (x % n + n) % n;
}

function getColors(text, palette) {
  // https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
  text = text.replace(/[\u{0080}-\u{FFFF}]/gu,"");
  return text.split('').map(x => x.toLowerCase().charCodeAt()).map(x => palette[mod(x - 97, palette.length)]);
}

function drawShapes(d, mask, space, width, height, colors, lines, columns, overlap, drawingOps) {
  let j = -1;

  if (overlap) {
    width = width + colors.length * space;
    height = height + colors.length * space;
  }

  for (let i=0; i < colors.length; i++) {
    // If we reached the number of columns, move to next line
    if (i%columns == 0) {
      j++;
    }

    if (overlap) {
      width = width - space;
      height = height - space;
    }

    let el = drawingOps[i % drawingOps.length](i, j, lines, d, space, width, height);

    if (overlap) {
      el.move((i/2) * space, (i/2) * space);
    } else {
      el.move((i%columns)*(width+space), j * (height + space));
    }

    el.attr({ fill: colors[i] });
  }

  return d;
}

function getFileDetails() {
  let files = $('#uploadForm').get(0).dropzone.getAcceptedFiles();
  let image, imageMimeType;
  if (files.length != 0) {
    imageMimeType = files[0].type;
    image = files[0].xhr.responseText;
  }
  return {'name': image, 'mime': imageMimeType};
}

function loadPaletteFromImage(filename) {
  $.ajax({
    method: 'POST',
    url: "/palette",
    cache: false,
    success: function(data) {
      $('#load-palette').modal('hide');
      colors = data.split('\n').map(color => '#' + color);
      setColors(colors);
      doUpdate();
    },
    error: function(err) {
      console.log(err);
    },
    data: {
      filename: filename
    }
  });
}

var joe;
var currentColor = -1;

$( document ).ready(function() {
  var socket = io('/');

  $('#load-palette').on('shown.bs.modal', function () {
    $('#image-url').trigger('focus');
  })

  $('#txt-content').on('change keyup paste', function(evt) {
    if ($('#auto-refresh').is(':checked')) {
      doUpdate();
    }
  });

  $('#show-preview').on('change', function(evt) {
    if ($(this).is(':checked')) {
      $('#drawing').show();
    } else {
      $('#drawing').hide();
    }
  });

  $('#chk-overlap').on('input', function(evt) {
    doUpdate();
  });

  $('#int-zoom').on('keyup input', function(evt) {
    let zoom = parseInt($(this).val());

    resizeShapes(shapes, zoom);
  });

  joe = colorjoe.rgb('pick', $('#hex').text());
  joe.on("change", setColor);
  joe.hide();
  $('#color-picker').hide();

  $('#btn-pick').on('click', function(evt) {
    let color = joe.get().hex();
    $('#color-picker').show();
    joe.show();
    $('#txt-colors').val(($('#txt-colors').val() + "\n" + color).trim());
    currentColor = colors.length;
    colors.push(color);
    fillColors('#list-colors', [color]);
    setCurrentBorder($('#list-colors span:last-child'));
  });

  $('#btn-save').on('click', function(evt) {
    let fileDetails = getFileDetails();
    var params = {
      image: fileDetails['name'],
      imageMimeType: fileDetails['mime'],
      text: getText('#txt-content'),
      colors: $('#txt-colors').val(),
      width: parseInt($('#int-width').val()),
      height: parseInt($('#int-height').val()),
      space: parseInt($('#int-space').val()),
      columns: parseInt($('#int-columns').val()),
      lines: parseInt($('#int-lines').val()),
      zoom: parseInt($('#int-zoom').val()),
      shape: $('input[name=shape]:checked').val(),
      overlap: $('#chk-overlap').is(':checked'),
    };
    socket.emit('export', params);
    $('#i-exporting').show();
    $('.progress').width('0%');
    $('.progress').css('visibility', 'visible');
    return;
    setTimeout(function(){
      $.ajax({
        method: 'POST',
        url: "https://3aubk8rr65.execute-api.eu-west-2.amazonaws.com/default/stix-svg-py",
        cache: false,
        dataType: 'binary',
        xhr: function(){
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            return xhr;
        },
        success: function(data){
          $('#i-exporting').hide();
          $('.progress').css('visibility', 'hidden');
          $('.progress').width('0%');
          $('#export-finished').snackbar('show');
          download(data, 'export.svg', 'image/svg+xml');
        },
        error: function(err) {
          $('#i-exporting').hide();
          $('.progress').css('visibility', 'hidden');
          $('.progress').width('0%');
          $('#export-error').snackbar('show');
          console.log(err);
        },
        data: params
      });
    }, 100);
  });

  $('#btn-load-palette').on('click', function(evt) {
    let imageUrl = $('#image-url').val();
    var params = {
      url: imageUrl,
    };
    $.ajax({
      method: 'POST',
      url: "/image",
      cache: false,
      success: loadPaletteFromImage,
      error: function(err) {
        console.log(err);
      },
      data: params
    });
  });

  socket.on('progress', (progress) => {
    $('.progress').width(progress + '%');
  });
  socket.on('connect', function(){
    console.log('connected');
  });
  socket.on('finished', function(data){
    $('.progress').width('100%');
    $('#i-exporting').hide();
    $('.progress').css('visibility', 'hidden');
    $('.progress').width('0%');
    console.log('finished', data);
    if (data && data.url) {
      window.location.href = data.url;
      $('#export-finished').snackbar('show');
    }
  });
  socket.on('disconnect', function(){
    console.log('disconnected');
  });
});

function resizeShapes(shapes, zoom) {
    if (zoom <= 0) {
      return;
    }
    let width = parseInt($('#int-original-width').val());
    let height = parseInt($('#int-original-height').val());

    if (shapes) {
      shapes.transform({scale: zoom/100, cx: 0, cy: 0});
    }

    draw.size(width * zoom / 100, height * zoom / 100);
}

function fillColors(id, colors) {
  let content, letter;
  let a = 'a'.charCodeAt();
  let el = $(id);
  let existingColorsN = el.find('span').length;
  let total = existingColorsN + colors.length;
  colors.forEach(function(color, i) {
    let j = existingColorsN + i;
    if (j < 26 && j < total) {
      letter = String.fromCharCode(a + j).toUpperCase();
    } else {
      letter = '';
    }
    content = `<span class="color-item" data-color="` + color + `" style="background-color: ` + color + `">` + letter + `</span>`;
    el.append(content);
  });
}

function setColor(color) {
  if (currentColor !== -1) {
    let el = $('#list-colors span:eq('+currentColor+')');
    colors[el.index()] = color.hex();
    el.css('background-color', color.hex());
    el.attr('data-color', color.hex());
  }
  $('#hex').text(color.hex());
  setColorsTxt('#txt-colors', colors);
}

function setColorsTxt(id, colors) {
  $(id).val(colors.join('\n'));
}

function setCurrentBorder(el) {
  el.parent().children('span').removeClass('current-border');
  el.addClass('current-border');
};
