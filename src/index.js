/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED */
'use strict';

// return formatted HTML version of JSON object
window.syntaxHighlight = function (json) {
  json = JSON.stringify(json, undefined, 4);
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
  return json;
}; // --- End of syntaxHighlight --- //

// Send a message back to Node-RED
window.fnSendToNR = function fnSendToNR(topic, payload) {
  uibuilder.send({
    topic,
    payload,
  });
};

// run this function when the document is loaded
window.onload = function () {
  // Start up uibuilder - see the docs for the optional parameters
  uibuilder.start();
  if (document.title == 'Home - KTCXPGT') {
    fnSendToNR('init', 'init');
  }

  // Listen for incoming messages from Node-RED
  uibuilder.onChange('msg', function (msg) {
    console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg);

    if (msg.topic == 'init' && msg.payload.length > 0) {
      document.querySelector('.mesin').innerHTML = '';
      document.querySelector('.problem').innerHTML = '';
      document.querySelector('.tanggal').innerHTML = '';
      document.querySelector('.jam').innerHTML = '';
      document.querySelector('.mesin').innerHTML = msg.payload[0].no_mesin;
      document.querySelector('.problem').innerHTML = msg.payload[0].nama_problem;
      document.querySelector('.tanggal').innerHTML = new Date(msg.payload[0].tanggal).toLocaleDateString('en-US');
      document.querySelector('.jam').innerHTML = msg.payload[0].waktu;
    }

    if (msg.payload == 'ok') {
      Swal.fire('Selamat', `Data ${msg.topic} berhasil ditambahkan`, 'success');
    } else if (msg.payload == 'gagal') {
      Swal.fire('Maaf', `Data gagal ditambahkan, pesan: ${msg.error.message}`, 'error');
    }

    // dump the msg as text to the "msg" html element
    // const eMsg = document.getElementById('msg');
    // eMsg.innerHTML = window.syntaxHighlight(msg);
    // console.log(msg);
    // console.log(window.syntaxHighlight(msg));
  });
};

window.setCookie = function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
};

window.getCookie = function getCookie(cname) {
  let name = cname + '=';
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};
function test() {
  let v = document.getElementById('departemen').value;
  if (v == 'engineering') {
    document.getElementById('spesialisasi').style.display = 'inline-block';
  } else {
    document.getElementById('spesialisasi').style.display = 'none';
  }
}
let counter = 0;
window.addEventListener('click', async () => {
  // setTimeout(()=>)
  counter++;
  setTimeout(() => (counter = 0), 5000);
  if (counter === 10) {
    counter = 0;
    const { value: formValues } = await Swal.fire({
      title: 'Tambah Karyawan',
      html:
        // `<div style="max-width: 70vw;overflow-x: hidden;">` +
        '<input id="no_penneng" class="swal2-input" placeholder="no penneng" required>' +
        '<input id="nama" class="swal2-input" placeholder="nama" required>' +
        `<select name="plant" id="plant" class="swal2-select" required>
            <option value="">-- Plant --</option>
            <option value="D">D</option>
            <option value="K">K </option>
          </select>
          <select onchange="test()" name="departemen" id="departemen" class="swal2-select" required>
            <option value="">-- Dept--</option>
            <option value="produksi">Produksi</option>
            <option value="engineering">Engineering</option>
          </select>
          <select name="spesialisasi" id="spesialisasi" class="swal2-select" style="display:none;">
            <option value="">-- Spesialisasi --</option>
            <option value="ELEKTRIK">ELEKTRIK</option>
            <option value="MEKANIK">MEKANIK</option>
          </select>
          `,
      footer: '<a href="/scanner/tabel.html">Lihat rekaman data</a>',
      focusConfirm: false,

      preConfirm: () => {
        if (document.getElementById('no_penneng').value == '' || document.getElementById('nama').value == '' || document.getElementById('plant').value == '' || document.getElementById('departemen').value == '') {
          Swal.fire('Tolong lengkapi data, masih ada yang kosong');
        }
        return [document.getElementById('no_penneng').value, document.getElementById('nama').value, document.getElementById('plant').value, document.getElementById('departemen').value, document.getElementById('spesialisasi').value];
      },
    });

    if (formValues) {
      let karyawan = formValues[0] + ';' + formValues[1] + ';' + formValues[2] + ';' + formValues[3] + ';' + formValues[4];
      console.log(karyawan);
      fnSendToNR('add-employee', karyawan);
    }
  }
  // }, 5000);
});
