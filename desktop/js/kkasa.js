
/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */

$("#table_cmd").sortable({axis: "y", cursor: "move", items: ".cmd", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true});
/*
 * Fonction pour l'ajout de commande, appellé automatiquement par plugin.
 */
function addCmdToTable(_cmd) {
    if (!isset(_cmd)) {
        var _cmd = {configuration: {}};
    }
    if (!isset(_cmd.configuration)) {
        _cmd.configuration = {};
    }
    var tr = '<tr class="cmd cmdKkasa" data-cmd_id="' + init(_cmd.id) + '">';
    tr += '<td>';
    tr += '<span class="cmdAttr" data-l1key="id" style="display:none;"></span>';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="name" style="width : 140px;" placeholder="{{Nom}}">';
    tr += '</td>';

    tr += '<td>';
    tr += '<span>';
    tr += '<input type="checkbox" class="cmdAttr" data-size="mini" data-label-text="{{Visible}}" data-l1key="isVisible" />{{Visible}}';
    if (isset(_cmd.type) && _cmd.type=='info') {
      tr += '<br />';
      tr += '<input type="checkbox" class="cmdAttr" data-size="mini" data-label-text="{{Historiser}}" data-l1key="isHistorized" />{{Historiser}}';
    }
    tr += '</span>';
    tr += '</td>';
    tr += '<td>';
    if (is_numeric(_cmd.id)) {
        tr += '<a class="btn btn-default btn-xs cmdAction" data-action="configure"><i class="fa fa-cogs"></i></a> ';
        tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fa fa-rss"></i> {{Tester}}</a>';
    }
    tr += '<i class="fa fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i>';
    tr += '</td>';
    tr += '</tr>';
    $('#table_cmd tbody').append(tr);
    $('#table_cmd tbody tr:last').setValues(_cmd, '.cmdAttr');
    if (isset(_cmd.type)) {
        $('#table_cmd tbody tr:last .cmdAttr[data-l1key=type]').value(init(_cmd.type));
    }
    jeedom.cmd.changeType($('#table_cmd tbody tr:last'), init(_cmd.subType));
}

function kkasaCreateCmd(cmdType,force=0)
{
  $.ajax({
      type: "POST",
      url: "plugins/kkasa/core/ajax/kkasa.ajax.php",
      data: {
          action: "createCmd",
          id: $('.eqLogicAttr[data-l1key=id]').value(),
          createcommand: force,
          cmdType: cmdType
      },
      dataType: 'json',
      global: false,
      error: function (request, status, error) {
          handleAjaxError(request, status, error);
      },
      success: function (data) {
          if (data.state != 'ok') {
              $('#div_alert').showAlert({message: data.result, level: 'danger'});
              return;
          }
          $('#div_alert').showAlert({message: '{{Opération réalisée avec succès}}', level: 'success'});
          $('.li_eqLogic[data-eqLogic_id=' + $('.eqLogicAttr[data-l1key=id]').value() + ']').click();
      }
  });
}

$('#btSync').on('click', function () {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/kkasa/core/ajax/kkasa.ajax.php", // url du fichier php
        data: {
            action: "syncWithKasa",
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
            $('#div_alert').showAlert({message: "{{Synchronisation réussie}}. "+data.result.toString()+" {{équipement(s) trouvé(s)}}. {{Merci de raffraichir la page}}", level: 'success'});
            var vars = getUrlVars();
            var url = 'index.php?';
            for (var i in vars) {
              if (i != 'id' && i != 'saveSuccessFull' && i != 'removeSuccessFull') {
                url += i + '=' + vars[i].replace('#', '') + '&';
              }
            }
            url += 'syncedDevices=' + data.result.toString();
            loadPage(url);
        }
    });
});

$('#btDebug').on('click', function () {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/kkasa/core/ajax/kkasa.ajax.php", // url du fichier php
        data: {
            action: "debugInfo",
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
            $('#div_alert').showAlert({message: '{{Informations debug inscrites dans les log}}', level: 'success'});
        }
    });
});

$('.bt_kkasaCreateCmd').on('click', function () {
  var cmdType = $(this).attr("dataCmdType");
  var dialog_title = '{{Recharge configuration}}';
  var dialog_message = '<form class="form-horizontal onsubmit="return false;"> ';
  dialog_title = '{{Recharger la configuration}}';
  dialog_message += '<label class="control-label" > {{Sélectionner le mode de rechargement de la configuration}} </label> ' +
  '<div> <div class="radio"> <label > ' +
  '<input type="radio" name="command" id="command-0" value="0" checked="checked"> {{Sans recréer les commandes mais en créeant les manquantes}} </label> ' +
  '</div><div class="radio"> <label > ' +
  '<input type="radio" name="command" id="command-1" value="1"> {{En recréant les commandes}}</label> ' +
  '</div> ' +
  '</div><br>' +
  '<label class="lbl lbl-warning" for="name">{{Attention, "en recréant les commandes" va supprimer les commandes existantes.}}</label> ';
  dialog_message += '</form>';
  bootbox.dialog({
    title: dialog_title,
    message: dialog_message,
    buttons: {
      "{{Annuler}}": {
        className: "btn-danger",
        callback: function () {}
      },
      success: {
        label: "Démarrer",
        className: "btn-success",
        callback: function () {
          createCommand = $("input[name='command']:checked").val();
          if (createCommand == "1")
          {
            bootbox.confirm('{{Etes-vous sûr de vouloir récréer les commandes ? Cela va supprimer les commandes existantes}}', function (result) {
              if (result) {
                kkasaCreateCmd(cmdType,force=1);
              }
            });
          } else
          {
            kkasaCreateCmd(cmdType,force=0);
          }
        }
      }
    },
  });
});

if (getUrlVars('syncedDevices') > 0) {
    $('#div_alert').showAlert(
      {message:
        '{{Synchronisation réussie}}. '
        + getUrlVars('syncedDevices')+" {{équipement(s) trouvé(s)}}. "
        , level: 'success'}
    );
}

function is_feature(feature) {
  var strFeatures = $(".eqLogicAttr[data-l2key='features']").val();
  return (strFeatures.indexOf(feature)>-1)
}

function show_hide_create_cmd_button(feature,cmdType)
{
  if(is_feature(feature))
    $(".bt_kkasaCreateCmd[dataCmdType='" + String(cmdType) + "']").show();
  else
    $(".bt_kkasaCreateCmd[dataCmdType='" + String(cmdType) + "']").hide();
}

$(document).ready(function() {
  $(".eqLogicAttr[data-l2key='features']").change(function(){
    if ($(this).val()!='')
    {
      show_hide_create_cmd_button('TIM','plug');
      show_hide_create_cmd_button('ENE','power');
      show_hide_create_cmd_button('LED','led');
      show_hide_create_cmd_button('DIM','bulb');

      /*if(is_feature('TIM'))
        $(".bt_kkasaCreateCmd[dataCmdType='plug']").show();
      else
        $(".bt_kkasaCreateCmd[dataCmdType='plug']").hide();
      if(is_feature('ENE'))
        $(".bt_kkasaCreateCmd[dataCmdType='power']").show();
      else
        $(".bt_kkasaCreateCmd[dataCmdType='power']").hide();
      if(is_feature('LED'))
        $(".bt_kkasaCreateCmd[dataCmdType='led']").show();
      else
        $(".bt_kkasaCreateCmd[dataCmdType='led']").hide();*/
    }
  });
});
