var prevRowOnFocus=null;
var sessionIdStr=null;

function extractValues(mappings) {
  return Object.keys(mappings);
}

function lookupValue(mappings, key) {
  return mappings[key];
}

function lookupKey(mappings, name) {
  var keys = Object.keys(mappings);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    if (mappings[key] === name) {
      return key;
    }
  }
}

var priority = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  blocker:'Blocker',
  urgent:'Urgent',
  regulatory:'Regulatory'
};

var type1 = {
  bug: 'Bug',
  story: 'Story',
  epic: 'Epic',
  defect:'Defect',
  actionitem: 'Action Item',
  technicaltask:'Technical Task',
};

var type2 = {
  subtask:"Sub-task",
  release:'Release',
  deliverable:'Deliverable',
  initiative:'Initiative',
  risk:'Risk',
  assumption:'Assumption',
  issue:'Issue',
  dependency:'Dependency',
  technicalobjective:'Technical Objective',
}

var rowData=[];
var prt = extractValues(priority);
var typ1 = extractValues(type1);
var typ2 = extractValues(type2);
var type = Object.assign({}, type1, type2);
var typ = extractValues(type);
const status = ['Open','In Progress','Ready for Work','Testing', 'Blocked', 'On Hold', 'Ready for Testing', 'Refine', 'Closed', 'Peer Review','Ready to Release','Release'];
const name = ["Rachel","Edwards","Christopher","Perez","Thomas","Baker","Sara","Moore","Chris","Johnson"]

var gridOptions = {
  columnDefs: [
    {
      field: 'jiraNumber',
      headerName: 'ID',
      minWidth: 130,
      editable: false,
      cellRenderer: function(params) {
        return '<a href="#">' + params.value + '</a>'
      }
    },
    {
      field: 'title',
      minWidth: 100,
      tooltipField: 'title',
      filterParams: {
        showTooltips: true,
      }
    },
    {
      field: 'openIssue',
      headerName: 'Description',
      tooltipField: 'openIssue',
      minWidth: 100,
      editable: false,
    },
    {
      field: 'type',
      minWidth: 80,
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: params => {
        const selectedType = params.data.type.toLowerCase().replace(" ", "");
        if (selectedType === 'bug' || selectedType === "story" || selectedType === "epic" || selectedType === "actionitem" || selectedType === "defect" || selectedType === "technicaltask") {
          return {
            values: typ1,
            cellRenderer: TypeCellRenderer,
          };
        } else {
          return {
            values: typ2,
            cellRenderer: TypeCellRenderer,
          };
        }
      },
      valueFormatter: function (params) {
        return lookupValue(type, params.value);
      },
      valueParser: function (params) {
        return lookupKey(type, params.newValue);
      },
      cellRenderer: TypeCellRenderer,
    },
    {
      field: 'priority',
      minWidth: 90,
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: {
        values:prt,
        cellRenderer: PriorityCellRenderer,
      },
      valueFormatter: function (params) {
        return lookupValue(priority, params.value);
      },
      valueParser: function (params) {
        return lookupKey(priority, params.newValue);
      },
      cellRenderer: PriorityCellRenderer,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 90,
      editable: true,
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: params => {
        var originalStatus = params.data.status;

        if (originalStatus === 'Open') {
          return {
            values: ['Ready for Work', 'In Progress', 'On Hold', 'Refine'],
          };
        }
        else if(originalStatus === 'Refine' || originalStatus ==="Under Refinement") {
          return {
            values: ['Ready for Work', 'Closed', 'On Hold', 'Blocked'],
          };
        }
        else if(originalStatus === 'Ready for Work'){
          return {
            values: ['In Progress', 'Open', 'On Hold', 'Blocked'],
          };
        }
        else if(originalStatus === 'In Progress' || originalStatus === 'In progress'){
          return {
            values: ['Testing', 'Blocked', 'On Hold', 'Ready for Testing', 'Refine', 'Closed', 'Peer Review','Ready to Release'],
          };
        }
        else if(originalStatus === 'Test'){
          return {
            values: ['Ready to Release', 'Blocked', 'Closed', 'In progress', 'Ready for Testing','On hold','Peer Review'],
          };
        }
        else if(originalStatus === 'Ready for Release'){
          return {
            values: ['Testing','Release','In Progress'],
          };
        }
        else if(originalStatus === 'Release'||originalStatus === 'Closed'){
          return {
            values: ['Open'],
          };
        }
        else if(originalStatus === 'On Hold'){
          return {
            values: ['Testing','In Progress','Ready for Work','Closed'],
          };
        }
        else if(originalStatus === 'Ready for Testing'){
          return {
            values: ['Test','Peer Review','In Progress'],
          };
        }
        else if(originalStatus === 'Peer Review'){
          return {
            values: ['Testing','Ready for Testing','In Progress','Ready to Release'],
          };
        }
        else if(originalStatus === 'Ready for Release' || originalStatus === 'Ready to Release'){
          return {
            values: ['Testing','Realease','In Progress'],
          };
        }
        else if(originalStatus === 'Blocked'){
          return {
            values: ['In Progress','Ready for Work','Testing','Closed'],
          };
        }
        else {
          return {
            values: ['Open'],
          };
        }

      },
    },
    {
      field: 'jiraAssignee',
      headerName:'Assignee',
      minWidth: 120,
      tooltipField: 'jiraAssignee',
      cellEditor: 'agTextCellEditor',
      cellEditorParams: {
        useFormatter: true,
      },
    },
    {
      field: 'comment',
      minWidth: 100,
    },
    {
      field: 'originalEstimate',
      minWidth: 80,
      tooltipField: 'originalEstimate'
    },
    {
      field: 'dueDate',
      editable: true,
      filter: 'agDateColumnFilter',
      minWidth: 110,
      cellEditor: 'datePicker',
      filterParams: {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
          var dateAsString = cellValue;
          if (dateAsString == null) return -1;
          var dateParts = dateAsString.split('/');
          var cellDate = new Date(
            Number(dateParts[2]),
            Number(dateParts[1]) - 1,
            Number(dateParts[0])
          );
          if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
          }
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          }
          if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
        },
        browserDatePicker: true,
        minValidYear: 2000,
      },
    }
  ],
  defaultColDef: {
    flex: 1,
    filter: true,
    editable: true,
    wrapText: true,
    autoHeight: false,
    sortable: true,
    resizable: true,
    enableRowGroup: false,
    rowHeight: 28,
    floatingFilter: true,
  },
  components: {
    datePicker: getDatePicker(),
  },
  rowData: rowData,
  paginationPageSize: 25,
  enableCellChangeFlash: true,
  animateRows: true,
  statusBar: {
    statusPanels: [
      {
        statusPanel: 'agTotalAndFilteredRowCountComponent',
        align: 'left',
      }
    ]
  },
  enableRangeSelection: true,
  onCellValueChanged: onCellValueChanged,
  overlayLoadingTemplate: '<img id="loading-image" src="loader.gif" style="width: 35px;" alt="Loading..."/>',
  // -------------- Row Height ------------------
  // onRowClicked(params) {
  //   gridOptions.api.resetRowHeights();
  //   if(params.node.rowIndex==prevRowOnFocus)
  //     params.node.setRowHeight(28);
  //   else
  //     params.node.setRowHeight(100);
  //   prevRowOnFocus=params.node.rowIndex;
  // },
  // onViewportChanged: onScroll,
};

// function onScroll(){
//   gridOptions.api.resetRowHeights();
// }

function getDatePicker() {
  function Datepicker() {}
  Datepicker.prototype.init = function (params) {
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;
    this.eInput.classList.add('ag-input');
    this.eInput.style.height = '100%';
    $(this.eInput).datepicker({
      dateFormat: 'D M dd yy 00:00:00',
    });
  };
  Datepicker.prototype.getGui = function () {
    return this.eInput;
  };
  Datepicker.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    this.eInput.select();
  };
  Datepicker.prototype.getValue = function () {
    return this.eInput.value;
  };
  Datepicker.prototype.destroy = function () {
  };
  Datepicker.prototype.isPopup = function () {
    return false;
  };
  return Datepicker;
}

document.addEventListener('DOMContentLoaded', function () {
  $( "#search" ).click(function() { sendName(); });
  $( "#update" ).click(function() { updateJiras(); });
  var eGridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(eGridDiv, gridOptions);
  $("#update").prop("disabled", true);
  gridOptions.api.setRowData(close_filter);
});

var rowData = new Array(20).fill().map(function() {
    return {
      jiraNumber: "PROJECT"+Math.floor(Math.random() * 4 + 1)+" - "+Math.floor(Math.random() * 900 + 100),
      openIssue: "Description"+Math.floor(Math.random() * 900 + 100),
      title: "Issue"+Math.floor(Math.random() * 900 + 100),
      type: typ[Math.floor(Math.random() * 14)],
      priority: prt[Math.floor(Math.random() * 6)],
      status:status[Math.floor(Math.random() * 12)],
      jiraAssignee: name[Math.floor(Math.random() * 10)],
      dueDate: new Date(2021,Math.floor(Math.random() * 12 + 1),Math.floor(Math.random() * 30 + 1)),
      originalEstimate:Math.floor(Math.random() * 9 + 1)+"w "+Math.floor(Math.random() * 9 + 1)+"d "
    };
});
var close_filter = rowData.filter( element => element.status != "Closed");

function sendName() {
  gridOptions.api.showLoadingOverlay();
  setTimeout(() => {
    gridOptions.api.hideOverlay();
    var row_filter;
    if (document.getElementById("closedJiras").checked == false){
      row_filter = close_filter.filter( element => element.jiraNumber.startsWith( document.getElementById("project").value));
      row_filter = row_filter.filter( element => element.status != "Closed");
    }else{
      row_filter = rowData.filter( element => element.jiraNumber.startsWith( document.getElementById("project").value));
    }
    gridOptions.api.setRowData(row_filter);
  }, 2000);
}

var msg = "";
function updateJiras(){
  $("#update").prop("disabled", true);
  var modal = document.getElementById("myModal");
  var span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";
  document.getElementById("modal-text").textContent = msg;
  console.log(msg);
  span.onclick = function () {
      modal.style.display = "none";
  }
  window.onclick = function (event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
  msg = "";
}

function onCellValueChanged(params) {
  $("#update").prop("disabled", false);
  msg += params.data.jiraNumber+" -> SUCCESS \n";
}

function singleUpload(){
  var singleUpload = document.getElementById("single-upload");
  var close = document.getElementsByClassName("close")[1];
  gridOptions.api.setRowData(rowData);
  singleUpload.style.display = "block";
  close.onclick = function() {
    singleUpload.style.display = "none";
  }
}

function singleJira(){
  var w = document.getElementById("weeks").value;
  var d = document.getElementById("days").value;
  var oeString = null;
  if (w!="" && d!="")
    oeString = w+"w "+d+"d";
  else if (w==""&& d!="")
    oeString = d+"d";
  else if (w!="" && d=="")
    oeString = w+"w";
  var dueDate="";
  if(document.getElementById("date").value != "")
    dueDate = new Date(document.getElementById("date").value);

  rowData.push({
    jiraNumber: document.getElementById("proj").value+" - "+Math.floor(Math.random() * 900 + 100),
    openIssue: document.getElementById("description").value,
    title: document.getElementById("title").value,
    type: document.getElementById("type").value,
    priority: document.getElementById("priority").value,
    status: "Open",
    jiraAssignee: document.getElementById("assignee").value,
    dueDate: dueDate,
    originalEstimate:oeString,
  });
  gridOptions.api.setRowData(rowData);
  console.log(rowData);
}

function downloadcsv() {
  var csvFileData = [];
    var csv = 'Project*,Title*,Description*,Type,Priority,Assignee,Original Estimate,Due Date\n';
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'SampleJiraFormat.csv';
    hiddenElement.click();
}

function uploadFile() {
  var formData = new FormData();
  formData.append('file', document.getElementById('txtFileUpload').files[0]);
  //var fd = new FormData(document.getElementById("txtFileUpload"));
  document.getElementById("file-modal-text").textContent = '';
  var fileUpload = document.getElementById("txtFileUpload");
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test(fileUpload.value.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var rows = e.target.result.split("\n");
                    for (var i = 1; i < rows.length-1; i++) {
                        var cells = rows[i].split(",");
                        if(cells[0] != "" && cells[1] != "" && cells[2] != "" && cells[3] != ""){
                          rowData.push({
                            jiraNumber: cells[0]+" - "+Math.floor(Math.random() * 900 + 100),
                            title: cells[1],
                            openIssue: cells[2],
                            type: cells[3],
                            priority: cells[4],
                            status: "Open",
                            jiraAssignee: cells[5],
                            dueDate: cells[7],
                            originalEstimate:cells[6],
                          });
                        }
                    }

                      if(cells[0] != "" && cells[1] != "" && cells[2] != "" && cells[3] != ""){
                        gridOptions.api.setRowData(rowData);
                        document.getElementById("file-modal-text").textContent = "Successfully Uploaded File";
                      }else{
                        document.getElementById("file-modal-text").textContent = "Failed to Uploaded File";
                        document.getElementById("file-modal-text-extra").textContent = "Please fill the compulsory fields and Try Again";
                      }
                }
                reader.readAsText(fileUpload.files[0]);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid CSV file.");
        }
}

function bulkUpload(){
  var bulkUpload = document.getElementById("bulk-upload");
  var close = document.getElementsByClassName("close")[2];
  bulkUpload.style.display = "block";
  close.onclick = function() {
    bulkUpload.style.display = "none";
  }
}

function PriorityCellRenderer() {}
PriorityCellRenderer.prototype.init = function (params) {
  this.eGui = document.createElement('span');
  if(params.value.toLowerCase() === 'high' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="20">\n' +
      '  <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="-46.25" y1="65.1105" x2="-46.25" y2="64.1105" gradientTransform="matrix(12 0 0 -13.1121 563 854.7415)">\n' +
      '    <stop offset="0" stop-color="#ff5630"/>\n' +
      '    <stop offset="1" stop-color="#ff8f73"/>\n' +
      '  </linearGradient>\n' +
      '  <path d="M2.5 4l5-2.9c.3-.2.7-.2 1 0l5 2.9c.3.2.5.5.5.9v8.2c0 .6-.4 1-1 1-.2 0-.4 0-.5-.1L8 11.4 3.5 14c-.5.3-1.1.1-1.4-.4-.1-.1-.1-.3-.1-.5V4.9c0-.4.2-.7.5-.9z" fill="url(#a)"/>\n' +
      '</svg> High';
  }
  if(params.value.toLowerCase() === 'regulatory' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="20">\n' +
      '  <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="-46.25" y1="65.1105" x2="-46.25" y2="64.1105" gradientTransform="matrix(12 0 0 -13.1121 563 854.7415)">\n' +
      '    <stop offset="0" stop-color="#ff5630"/>\n' +
      '    <stop offset="1" stop-color="#ff8f73"/>\n' +
      '  </linearGradient>\n' +
      '  <path d="M2.5 4l5-2.9c.3-.2.7-.2 1 0l5 2.9c.3.2.5.5.5.9v8.2c0 .6-.4 1-1 1-.2 0-.4 0-.5-.1L8 11.4 3.5 14c-.5.3-1.1.1-1.4-.4-.1-.1-.1-.3-.1-.5V4.9c0-.4.2-.7.5-.9z" fill="url(#a)"/>\n' +
      '</svg> Regulatory';
  }
  if(params.value.toLowerCase() === 'urgent' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="20">\n' +
      '  <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="-46.25" y1="65.1105" x2="-46.25" y2="64.1105" gradientTransform="matrix(12 0 0 -13.1121 563 854.7415)">\n' +
      '    <stop offset="0" stop-color="#ff5630"/>\n' +
      '    <stop offset="1" stop-color="#ff8f73"/>\n' +
      '  </linearGradient>\n' +
      '  <path d="M2.5 4l5-2.9c.3-.2.7-.2 1 0l5 2.9c.3.2.5.5.5.9v8.2c0 .6-.4 1-1 1-.2 0-.4 0-.5-.1L8 11.4 3.5 14c-.5.3-1.1.1-1.4-.4-.1-.1-.1-.3-.1-.5V4.9c0-.4.2-.7.5-.9z" fill="url(#a)"/>\n' +
      '</svg>Urgent';
  }
  if(params.value.toLowerCase() === 'blocker' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="20">\n' +
      '  <path d="M8 15c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zM4 7c-.6 0-1 .4-1 1s.4 1 1 1h8c.6 0 1-.4 1-1s-.4-1-1-1H4z" fill="#ff5630"/>\n' +
      '</svg> Blocker'
  }
  if(params.value.toLowerCase() === 'medium' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="20">\n' +
      '  <path d="M8.045319 12.806152l4.5-2.7c.5-.3 1.1-.1 1.3.4s.2 1.1-.3 1.3l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7z" fill="#ff5630"/>\n' +
      '  <path d="M12.545319 5.806152c.5-.3 1.1-.1 1.3.3s.2 1.1-.3 1.4l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7 4.5-2.7z" fill="#ff7452"/>\n' +
      '  <path d="M12.545319 1.506152c.5-.3 1.1-.2 1.3.3s.2 1.1-.3 1.4l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7 4.5-2.7z" fill="#ff8f73"/>\n' +
      '</svg>Medium'
  }
  if(params.value.toLowerCase() === 'low' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="20">\n' +
      '  <path d="M8.045319 12.806152l4.5-2.7c.5-.3 1.1-.1 1.3.4s.2 1.1-.3 1.3l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7z" fill="#0065ff"/>\n' +
      '  <path d="M12.545319 5.806152c.5-.3 1.1-.1 1.3.3s.2 1.1-.3 1.4l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7 4.5-2.7z" fill="#2684ff"/>\n' +
      '  <path d="M12.545319 1.506152c.5-.3 1.1-.2 1.3.3s.2 1.1-.3 1.4l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7 4.5-2.7z" fill="#4c9aff"/>\n' +
      '</svg>Low'
  }
};
PriorityCellRenderer.prototype.getGui = function () {
  return this.eGui;
};

function TypeCellRenderer() {}
TypeCellRenderer.prototype.init = function (params) {
  this.eGui = document.createElement('span');
  if(params.value.toLowerCase() === 'bug' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" fill="#FF5630"/><circle fill="#FFF" cx="8" cy="8" r="4"/></g></svg> Bug';
  }
  if(params.value.toLowerCase() === 'defect' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" fill="#FF5630"/><circle fill="#FFF" cx="8" cy="8" r="4"/></g></svg> Defect';
  }
  if(params.value.toLowerCase() === 'story' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" fill="#36B37E"/><path d="M4.5 12.5V4.378c0-.485.392-.878.875-.878h5.25c.483 0 .875.393.875.878V12.5L8 8.988 4.5 12.5z" fill="#FFF"/></g></svg> Story';
  }
  if(params.value.toLowerCase() === 'epic' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 2.002A2 2 0 0 1 2.002 0h11.996A2 2 0 0 1 16 2.002v11.996A2 2 0 0 1 13.998 16H2.002A2 2 0 0 1 0 13.998V2.002z" fill="#6554C0"/><path d="M11.898 7.666a.678.678 0 0 0-.564-1.04L8 6.624V3.187a.678.678 0 0 0-.666-.687.65.65 0 0 0-.54.307.693.693 0 0 0-.088.178l-2.598 5.34A.738.738 0 0 0 4 8.689c0 .38.3.687.667.687H8v3.438c0 .38.3.687.667.687a.655.655 0 0 0 .557-.331l.022-.035c.014-.029.03-.055.041-.085l2.61-5.383z" fill="#FFF" fill-rule="nonzero"/></g></svg> Epic'
  }
  if(params.value.toLowerCase() === 'actionitem' || params.value ==='Action Item' ){
   this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 2.002A2 2 0 0 1 2.002 0h11.996A2 2 0 0 1 16 2.002v11.996A2 2 0 0 1 13.998 16H2.002A2 2 0 0 1 0 13.998V2.002z" fill="#6554C0"/><path d="M8 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM8 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" fill="#FFF" fill-rule="nonzero"/><path d="M7 8.69l2.72-2.72a.75.75 0 0 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 1.06-1.06l.97.97z" fill="#FFF" fill-rule="nonzero"/></g></svg> Action Item'
 }
  if(params.value.toLowerCase() === 'technicaltask' || params.value ==='Technical Task' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" fill="#2684FF"/><path d="M7.933 7h4.134c.515 0 .933.418.933.933v4.134a.933.933 0 0 1-.933.933H7.933A.933.933 0 0 1 7 12.067V7.933C7 7.418 7.418 7 7.933 7z" fill="#FFF"/><path d="M4.5 4.5v3h3v-3h-3zM3.933 3h4.134c.515 0 .933.418.933.933v4.134A.933.933 0 0 1 8.067 9H3.933A.933.933 0 0 1 3 8.067V3.933C3 3.418 3.418 3 3.933 3z" fill="#FFF" fill-rule="nonzero"/></g></svg> Technical Task'
  }
  if(params.value.toLowerCase() === 'subtask' || params.value ==='Sub-task' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" fill="#2684FF"/><path d="M7.933 7h4.134c.515 0 .933.418.933.933v4.134a.933.933 0 0 1-.933.933H7.933A.933.933 0 0 1 7 12.067V7.933C7 7.418 7.418 7 7.933 7z" fill="#FFF"/><path d="M4.5 4.5v3h3v-3h-3zM3.933 3h4.134c.515 0 .933.418.933.933v4.134A.933.933 0 0 1 8.067 9H3.933A.933.933 0 0 1 3 8.067V3.933C3 3.418 3.418 3 3.933 3z" fill="#FFF" fill-rule="nonzero"/></g></svg> Sub Task'
  }
  if(params.value.toLowerCase() === 'release' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" stroke-linecap="round" stroke-linejoin="round" fill="#2684FF"/><path d="M6.5 10.086l5.793-5.793a1 1 0 0 1 1.414 1.414l-6.5 6.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414L6.5 10.086z" fill="#FFF" fill-rule="nonzero"/></g></svg> Release'
  }
  if(params.value.toLowerCase() === 'deliverable' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" fill="#FF5630"/><path d="M7.267 6.966l-1.373 5.525c-.232.936-1.525 1.033-1.894.142l-2.174-5.25a1 1 0 0 1 1.848-.766l1.012 2.444L6.127 3.26c.24-.962 1.582-1.028 1.913-.093L9.476 7.21l.88-1.573a1 1 0 0 1 1.693-.083l1.522 2.187a1 1 0 0 1-1.642 1.143l-.608-.875-1.176 2.104c-.42.75-1.528.657-1.816-.154L7.267 6.966z" fill="#FFF" fill-rule="nonzero"/></g></svg> Deliverable'
  }
  if(params.value.toLowerCase() === 'initiative' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 2.002A2 2 0 0 1 2.002 0h11.996A2 2 0 0 1 16 2.002v11.996A2 2 0 0 1 13.998 16H2.002A2 2 0 0 1 0 13.998V2.002z" fill="#6554C0"/><path d="M4 9a1 1 0 1 1 0-2h8a1 1 0 0 1 0 2H4zM4 12.5a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2H4zM4 5.5a1 1 0 1 1 0-2h8a1 1 0 0 1 0 2H4z" fill="#FFF" fill-rule="nonzero"/></g></svg> Initiative'
  }
  if(params.value.toLowerCase() === 'risk' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 1.777C0 .796.796 0 1.777 0h12.446C15.204 0 16 .796 16 1.777v12.446c0 .981-.796 1.777-1.777 1.777H1.777A1.778 1.778 0 0 1 0 14.223V1.777z" fill="#36B37E"/><path d="M6.78 8.662c0-.966.672-1.428 1.232-1.834.434-.308.812-.574.812-.994 0-.434-.322-.798-1.092-.798-.49 0-.896.154-1.246.448a.905.905 0 0 1-.476.14.856.856 0 1 1-.49-1.568 4.009 4.009 0 0 1 2.422-.784c1.806 0 2.912.91 2.912 2.212 0 1.162-.756 1.722-1.414 2.184-.476.364-.924.672-.924 1.162 0 .042.014.238.014.266-.042.406-.406.77-.84.77a.798.798 0 0 1-.77-.588 1.367 1.367 0 0 1-.14-.616zm0 3.108c0-.616.518-1.134 1.134-1.134.616 0 1.134.518 1.134 1.134 0 .616-.518 1.134-1.134 1.134A1.147 1.147 0 0 1 6.78 11.77z" fill="#FFF"/></g></svg> Risk'
  }
  if(params.value.toLowerCase() === 'assumption' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 2.002A2 2 0 0 1 2.002 0h11.996A2 2 0 0 1 16 2.002v11.996A2 2 0 0 1 13.998 16H2.002A2 2 0 0 1 0 13.998V2.002z" fill="#2684FF"/><path d="M6.42 11.654a.798.798 0 0 1-.566-.234L3.278 8.844a.958.958 0 0 1 0-1.35l2.51-2.51A.802.802 0 0 1 6.92 6.116L4.866 8.169l2.12 2.12a.8.8 0 0 1-.566 1.365M9.657 11.654a.8.8 0 0 1-.566-1.365l2.12-2.12-2.053-2.054a.8.8 0 0 1 1.13-1.13l2.51 2.51c.18.177.28.416.28.672a.946.946 0 0 1-.28.677l-2.575 2.576a.796.796 0 0 1-.566.234z" fill="#FFF"/></g></svg> Assumption'
  }
  if(params.value.toLowerCase() === 'issue' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 2.002A2 2 0 0 1 2.002 0h11.996A2 2 0 0 1 16 2.002v11.996A2 2 0 0 1 13.998 16H2.002A2 2 0 0 1 0 13.998V2.002z" fill="#FF991F"/><path d="M8 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="#FFF" fill-rule="nonzero"/><path d="M4.5 6.75h7a.5.5 0 0 1 .5.5v4.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4.5a.5.5 0 0 1 .5-.5z" fill="#FFF"/><path d="M8 8.25a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1z" fill="#FF991F"/></g></svg> Issue'
  }
  if(params.value.toLowerCase() === 'dependency' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 2.002A2 2 0 0 1 2.002 0h11.996A2 2 0 0 1 16 2.002v11.996A2 2 0 0 1 13.998 16H2.002A2 2 0 0 1 0 13.998V2.002z" fill="#FF991F"/><path d="M8 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="#FFF" fill-rule="nonzero"/><path d="M4.5 6.75h7a.5.5 0 0 1 .5.5v4.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4.5a.5.5 0 0 1 .5-.5z" fill="#FFF"/><path d="M8 8.25a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1z" fill="#FF991F"/></g></svg> Dependency'
  }
  if(params.value === 'Technical Objective' || params.value.toLowerCase() === 'technicalobjective' ){
    this.eGui.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path d="M0 2.002A2 2 0 0 1 2.002 0h11.996A2 2 0 0 1 16 2.002v11.996A2 2 0 0 1 13.998 16H2.002A2 2 0 0 1 0 13.998V2.002z" fill="#36B37E"/><path d="M9 12.09c0 .503-.448.91-1 .91s-1-.407-1-.91V3.91C7 3.406 7.448 3 8 3s1 .407 1 .91v8.18z" fill="#FFF" fill-rule="nonzero"/><path d="M4.957 8.207a1 1 0 0 1-1.414-1.414l3.75-3.75a1 1 0 0 1 1.414 0l3.75 3.75a1 1 0 1 1-1.414 1.414L8 5.164 4.957 8.207z" fill="#FFF" fill-rule="nonzero"/></g></svg> Technical Objective'
  }
};
TypeCellRenderer.prototype.getGui = function () {
  return this.eGui;
};
