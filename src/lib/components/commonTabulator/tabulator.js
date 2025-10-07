/** 
  * @ Overview tabulator js
  * @ History 2024-09-24 / 윤정서 / 최초작성 (tabulator frame js 작성)
*/

//Tabulator용 공통함수
const tb_common_functions = {

    baseLayout : {
      // layout: "fitColumns",
      layout: "fitDataFill",
      minHeight: 200,
      placeholder: "등록된 내용이 존재하지 않습니다.",
      data: [], //기본 데이터
      columns: [], //컬럼 설정
      columnDefaults: { //컬럼 공통 규칙
        vertAlign: "middle",
        hozAlign: "center",
        resizable: "header",//Resize 는 헤더에서만 가능
        headerHozAlign: "center", //헤더 정렬
        headerSortTristate: true, //데이터 정렬 => 정/역/초기화
      },
      headerSortElement: "<i class='bi'></i>", //정렬 아이콘
      rowFormatter: function () { 
      },
    },
  
    baseLayoutPage : {
      // layout: "fitColumns",
      layout: "fitDataFill",
      minHeight: 200,
      placeholder: "등록된 내용이 존재하지 않습니다.",
      data: [], //기본 데이터
      columns: [], //컬럼 설정
      columnDefaults: { //컬럼 공통 규칙
        sorter:()=>{},
        headerSort: false,
        vertAlign: "middle",
        hozAlign: "center",
        resizable: "header",//Resize 는 헤더에서만 가능
        headerHozAlign: "center", //헤더 정렬
        headerSortTristate: true, //데이터 정렬 => 정/역/초기화
      },
      headerSortElement: "<i class='bi'></i>", //정렬 아이콘
      rowFormatter: function () {
      },
      footerElement: "<div class='tabulator-footer'></div>", // 푸터 요소를 추가
    },
  
    // 휴지통 클릭하면 use flg(사용여부) n으로 바뀌고 삭제해주는 cell click
    toggleTrashIcon : function(e, tgt) {
      if( tgt.getField() !== "Del_Check" ) return; //컬럼명 확인
      if( tgt._cell.column.definition.formatterParams?.checkCond && !tgt._cell.column.definition.formatterParams?.checkCond(tgt) ) return; //출력조건 확인
  
      tgt.setValue(tgt.getValue()==='Y'?'N':'Y');
      tgt.getRow().update({});
    },
  
    // formatter : 휴지통 아이콘
    formatterTrashIcon : function(tgt, params) {
      if(tgt)
      return "<i class='fa-solid fa-trash-can tb-btn-trash'></i>";
    },
  
    // 즐겨찾기 toggle 시 Fav_Check Value 'Y / N' return
    toggleFavoritCheck : function(e, tgt) {
      if( tgt.getField() !== "Fav_Check") return;
      if( tgt._cell.column.definition.formatterParams?.checkCond && !tgt._cell.column.definition.formatterParams?.checkCond(tgt) ) return; //출력조건 확인
  
      tgt.setValue(tgt.getValue()==='Y'?'N':'Y');
      tgt.getRow().update({});
    }, //
  
    // 즐겨찾기 formatter
    formatterFavoritIcon : function(tgt, parmas) {
      return "<i class='fa-regular fa-star tb-btn-fav'></i>";
    },
  
    //토글버튼 출력
    formatterToggleUsrIcon: function (tgt, params) {
      let cell = tgt._cell;
      let span = document.createElement("span");
  
      if( params.checkCond && !params.checkCond(tgt) ){
        span.className = '';
        return span;
      }
  
      if ( params.checkval && cell.value == params.checkval || !params.checkval && cell.value == true) {
        span.className = params.checkIcon;
      } else {
        span.className = params.unCheckIcon;
      }
      return span;
    },
  
    //토글버튼 출력
    formatterToggleboxIcon: function (tgt, params) {
      let cell = tgt._cell;
      let span = document.createElement("span");
  
      if ( params.checkval && cell.value == params.checkval || !params.checkval && cell.value == true) {
        span.className = "bi bi-toggle-on tb_toggle";
      } else {
        span.className = "bi bi-toggle-off tb_toggle";
      }
      return span;
    },
  
    //토글버튼 출력 red
    formatterToggleboxRedIcon: function (tgt, params) {
      let cell = tgt._cell;
      let span = document.createElement("span");
  
      if ( params.checkval && cell.value == params.checkval || !params.checkval && cell.value == true) {
        span.className = "bi bi-toggle-on tb_toggle red";
      } else {
        span.className = "bi bi-toggle-off tb_toggle red";
      }
      return span;
    },
  
    //토글버튼 출력 green
    formatterToggleboxGreenIcon: function (tgt, params) {
      let cell = tgt._cell;
      let span = document.createElement("span");
  
      if ( params.checkval && cell.value == params.checkval || !params.checkval && cell.value == true) {
        span.className = "bi bi-toggle-on tb_toggle green";
      } else {
        span.className = "bi bi-toggle-off tb_toggle green";
      }
      return span;
    },
  
    //토글버튼 TEXT Icon
    formatterToggleboxText: function (tgt, params) {
      let cell = tgt._cell;
      let label = document.createElement("label");
      let span = document.createElement("span");
      let span2 = document.createElement("span");
      span2.classList.add("switch");
  
      label.classList.add("toggle-switchy");
      label.setAttribute("data-size", params.size||"xs");//크기
      label.setAttribute("data-style", params.shape||"rounded");//모양
  
      if ( params.checkval && cell.value === params.checkval || !params.checkval && cell.value === true) {
        span.classList.add('checked');
      } else {
        span.classList.add('notchecked');
      }
      span.classList.add('toggle');
      span.setAttribute('on',params.onval||'ON');
      span.setAttribute('off',params.offval||'OFF');
      span.appendChild(span2);
      label.appendChild(span);
      return label;
    },
  
    //Selected Circle 출력
    formatterSelCircleIcon: function (tgt, params) {
      let cell = tgt._cell;
      let em = document.createElement("i");
  
      if (cell.value == "Y") {
        em.className = "bi bi-circle-fill fa-2xs";
      } else {
        em.className = "";
      }
      return em;
    },
  
    //국가명  출력
    formatterNations: function (tgt, params) {
      let cell = tgt._cell;
      let nval = Object.keys(varsNations).filter(key => key === cell.value );
      return varsNations[nval[0]];
    },
    //통화 출력
    formatterCurrency: function (tgt, params) {
      let cell = tgt._cell;
      let nval = Object.keys(varsCURRENCY).filter(key => key === cell.value );
      return varsCURRENCY[nval[0]];
    },
  
    //Number / 통화. 출력
    formatterNumber: function (tgt, params) {
      if(!tgt.getValue()) return;
  
      let val = tgt.getValue();
      let config = {symbol:params?.symbol||'',precision:params?.precision||0,};
      if( params?.group) config.group = params.group;
      if( params?.pattern) config.pattern = params.pattern;
      if( params?.decimal) config.decimal = params.decimal;
      if( params?.separator) config.separator = params.separator;
      if( params?.negativePattern) config.negativePattern = params.negativePattern;
      let nval = currency(Number(val), config);
  
      return nval.format();
    },
  
    //체크버튼 출력 true/false
    formatterCheckboxIcon: function (tgt, params) {
      let cell = tgt._cell;
      let label = document.createElement("label");
      let input = document.createElement("input");
      input.type = "checkbox";
      input.className = "tb_checkbox";
      if( cell.value ){
        input.checked = true;
      }
      label.append(input);
      return label;
    },
  
    //체크버튼 출력 Y/N
    formatterCheckboxIconYn: function (tgt, params) {
      let cell = tgt._cell;
      let label = document.createElement("label");
      let input = document.createElement("input");
      input.type = "checkbox";
      input.className = "tb_checkbox";
      if(params['disabled']){
        input.disabled = params['disabled'];
      }
      if( cell.value === 'Y' ){
        input.checked = true;
      }
      label.append(input);
      return label;
    },
  
    //체크버튼 출력 Y/N Reverse
    formatterCheckboxIconRYn: function (tgt, params) {
      let cell = tgt._cell;
      let label = document.createElement("label");
      let input = document.createElement("input");
      input.type = "checkbox";
      input.className = "tb_checkbox";
      if( cell.value !== 'Y' ){
        input.checked = true;
      }
      label.append(input);
      return label;
    },
  
    //체크버튼 조회용 출력
    formatterCheckboxViewIcon: function (tgt, params) {
      let cell = tgt._cell;
      let label = document.createElement("label");
      if( cell.value ){
        let input = document.createElement("input");
        input.addEventListener("click",function(e){ e.stopPropagation(); e.preventDefault(); });
        input.type = "checkbox";
        input.className = "tb_checkbox";
        input.checked = true;
        label.append(input);
      } //else { input.checked = false; label.append(input); }
      return label;
    },
  
    //체크버튼 조회용 출력
    formatterCheckboxViewIcon2: function (tgt, params) {
      let cell = tgt._cell;
      let label = document.createElement("label");
      let input = document.createElement("input");
      input.addEventListener("click",function(e){ e.stopPropagation(); e.preventDefault(); });
      input.type = "checkbox";
      input.className = "tb_checkbox";
      label.append(input);
      if( cell.value ){
        input.checked = true;
      } else {
        input.checked = false;
      }
      return label;
    },
  
    //Check or Not 조회아이콘 출력
    formatterCheckIcon: function (tgt, params) {
      let cell = tgt._cell;
      let span = document.createElement("span");
      if( cell.value ){
        span.className = "bi bi-check-circle-fill tb_icon";
      }
      return span;
    },
  
    //Check or Not 조회아이콘 출력2
    formatterCheckIcon2: function (tgt, params) {
      let cell = tgt._cell;
      let span = document.createElement("span");
      if( cell.value == params.checkval ){
        span.className = "bi bi-check-circle-fill";
      }else{
        span.className = "bi bi-circle text-black-50";
      }
      return span;
    },
  
    //O or X 조회아이콘 출력
    formatterToggleIcon: function (tgt, params) {
      var cell = tgt._cell;
      let span = document.createElement("span");
      if( cell.value ){
        span.className = "bi bi-toggle-on tb_toggle";
      }else{
        span.className = "bi bi-toggle-off tb_toggle";
      }
      return span;
    },
  
    formatterSelect: function (tgt, formatterParams) {
      var cell = tgt._cell;
      let div = document.createElement("div");
      if(formatterParams.class) div.className = formatterParams.class;
      let nval = cell.value || formatterParams.default;
      div.innerHTML = formatterParams.values[nval] || (formatterParams.defaultValue || '');
      return div;
    },
    
    formatterSelectList:function(tgt, params) {
      let rowData = tgt.getData();
      if (
        rowData["REL"] === "S" ||
        !rowData["_children"] ||
        rowData["_children"].filter((sr) => sr["_STATUS_"] !== "D").length === 0
      ) {
        return tb_common_functions.formatterSelect(tgt, params);
      } else {
        return "";
      }
    },
    formatterButton: function (tgt, params) {
      var cell = tgt._cell;
      let btn = document.createElement("a");
      btn.className = params.btnClass;
      btn.innerHTML = params.btnTitle;
      if( params.event &&  params.cfunc ){
        if( !Array.isArray(params.event) ) params.event = Array(params.event);
        params.event.forEach( evt => btn.addEventListener(evt, ()=>{params.cfunc(cell);}));
      }
      return btn;
    },
  
    // 팝업 아이콘 formatter
    formatterPopupIcon : function(tgt, parmas) {
      // return "<i class='fa-solid fa-up-right-from-square'></i>";
      // return "<i class='fa-solid fa-arrow-up-right-from-square'></i>";
      return "<i class='fa-regular fa-clone'></i>";
    },
  
    // 팝업 아이콘 formatter
    formatterPopupIcon : function(tgt, parmas) {
      // return "<i class='fa-solid fa-up-right-from-square'></i>";
      // return "<i class='fa-solid fa-arrow-up-right-from-square'></i>";
      return "<i class='fa-regular fa-clone'></i>";
    },
  
    //Json formatter
    formatterJson: function( tgt, params ){
      var cell = tgt._cell;
      return params.values[cell.value];
    },
  
    //multicheckbox or radio formatter
    formatterMultiCheckBox: function( tgt, params ){
      var cell = tgt._cell;
      let div = document.createElement("form");
      if(params.class) div.className = params.class;
      params.inputs.forEach( ipt => {
        let label = document.createElement("label");
        label.className = ipt.class;
        let nipt = document.createElement("input");
        nipt.type = params.type||'checkbox';
        nipt.value = ipt.value;
        nipt.name = ipt.name;
        nipt.checked = ipt.value == (tgt.getData()[ipt.name]||params.default);
        nipt.addEventListener('change',(e)=>{
          if( e.target.checked ){
            cell.setValue(ipt.value);
          }
          return true;
        })
        label.append(ipt.title);
        label.append(nipt);
        div.append(label);
      } )
      return div;
    },
  
    formatterInvalidVal: function( tgt, params ){
      let boool = false;
      switch( params.sp ){
        case "=":
          boool = tgt.getData()[params.field] === params.value; break;
        case ">":
          boool = tgt.getData()[params.field] > params.value; break;
        case "<":
          boool = tgt.getData()[params.field] < params.value; break;
        case ">=":
          boool = tgt.getData()[params.field] >= params.value; break;
        case "<=":
          boool = tgt.getData()[params.field] <= params.value; break;
        case "!=":
        case "<>":
          boool = tgt.getData()[params.field] !== params.value; break;
        case "in":
          boool = params.value.includes(tgt.getData()[params.field]); break;
      }
  
      if( boool ){
        if( params.validClass ){
          tgt.getElement().classList.add(params.validClass);
        }
        if( params.validValue ){
          return params.validValue;
        }
      }else{
        if( params.invalidClass ){
          tgt.getElement().classList.add(params.invalidClass);
        }
        if( params.invalidValue ){
          return params.invalidValue;
        }
      }
      return tgt.getValue();
    },
  
    paramsFile : function(cell , {useView, useUp, useDown, gubun}) {
      let cval = cell.getData();
      const {FILE_NM, FILE_EXT, FILE_ID, FILE_NAME } = cval;
      let fileUrl = `/include/getFile.php?gubun=${gubun}&name=${FILE_NM}&fname=${FILE_NAME}&ext=${FILE_EXT}`;
      
      return {
        clsFile: "btn-info",
        useView: useView,
        useUp  : useUp,
        useDown: useDown,
        fileId: FILE_ID ||'',
        viewFunc: (e, cell, params) => {
          if (FILE_NM && FILE_EXT && FILE_ID) {
            
            pop_filedown(fileUrl, FILE_EXT, 'true');
          } else {
            kuls_warning("해당 첨부파일이 아직 없습니다.");
          }
        },
        uploadFunc: (e, cell, param)=>{
          cell.setValue(e.target.files[0]); //첨부파일 등록
          cell.getRow().update({'FILE_NAME':e.target.files[0].name, 'FILE_TYPE': e.target.files[0].type})
        },
        downFunc: (e, cell, params)=>{
          if (FILE_NM && FILE_EXT && FILE_ID) {
            location.href = fileUrl;
          } else {
            kuls_warning("해당 첨부서류가 없습니다.");
          }
        },
      }
    },
  
  
    /* formatter (파일) */
    formatterFile: function( cell, params ){
      let fileBox = document.createElement("div");
      fileBox.classList.add("tabulator_file_input");
      const uuid = params.fileId||''; //UUID로 첨부파일 유무 판단
  
      //조회버튼
      if( params.useView !== false ){
        let viewBtn = document.createElement("button");
        viewBtn.classList.add("btn","btn-view");
        if(uuid) viewBtn.classList.add(...(params.clsFile||'_').split(/[, ]/));
        if(!uuid) viewBtn.classList.add(...(params.clsnFile||'_').split(/[, ]/));
        let iconcls = params.clsView||"fa-solid fa-magnifying-glass";
        viewBtn.innerHTML = `<i class="${iconcls}"></i>`;
        viewBtn.addEventListener("click",function(e){ /**/
          e.preventDefault();
          if(params?.viewFunc){ params.viewFunc(e, cell, params); return; }
        });
  
        fileBox.appendChild(viewBtn);
      }
  
  
      //다운로드버튼
      if( params.useDown !== false ){
        let downBtn = document.createElement("button");
        downBtn.classList.add("btn","btn-down");
        if(uuid) downBtn.classList.add(...(params.clsFile||'_').split(/[, ]/));
        if(!uuid) downBtn.classList.add(...(params.clsnFile||'_').split(/[, ]/));
        let iconcls = params.clsDown||"fa-solid fa-download";
        downBtn.innerHTML = `<i class="${iconcls}"></i>`;
        downBtn.addEventListener("click",function(e){
          e.preventDefault();
          if(params?.downFunc){ params.downFunc(e, cell, params); return; }
        });
  
        fileBox.appendChild(downBtn);
      }
  
  
      //업로드버튼
      if( params.useUp !== false ){
        let lblFile = document.createElement("label");
        lblFile.classList.add("btn","lbl-down", ...(params.clsFile||'_').split(/[, ]/));
        let iconcls = params.clsUp||"fa-solid fa-upload";
        lblFile.innerHTML = `<i class="${iconcls}"></i>`;
        lblFile.addEventListener("change",function(e){
          e.preventDefault();
          if(params?.uploadFunc){ params.uploadFunc(e, cell, params);  return;}
  
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result;
            cell.setValue({
              type: file.type,
              name: file.name,
              size: file.size,
              base64: base64data,
            }); //첨부파일종류
          };
          reader.readAsDataURL(file);
        });
  
        //파일등록용 input
        let iptFile = document.createElement("input");
        iptFile.setAttribute("type", "file");
        lblFile.appendChild(iptFile);
  
        fileBox.appendChild(lblFile);
      }
  
      return fileBox;
    },
  
    /* formatter (파일: 다우에서 사용 (업로드 직후, 파일o, 파일x 다 다르게 표시)) */
    formatterFile2: function( cell, params ){
      let fileBox = document.createElement("div");
      fileBox.classList.add("tabulator_file_input");
      const uuid = params.fileId||''; //UUID로 첨부파일 유무 판단
  
      //조회버튼
      if( params.useView !== false ){
        let viewBtn = document.createElement("button");
        viewBtn.classList.add("btn","btn-view");
        if(uuid) viewBtn.classList.add(...(params.clsFile||'_').split(/[, ]/));
        if(!uuid) viewBtn.classList.add(...(params.clsnFile||'_').split(/[, ]/));
        let iconcls = params.clsView||"fa-solid fa-magnifying-glass";
        viewBtn.innerHTML = `<i class="${iconcls}"></i>`;
        viewBtn.addEventListener("click",function(e){ /**/
          e.preventDefault();
          if(params?.viewFunc){ params.viewFunc(e, cell, params); return; }
        });
  
        fileBox.appendChild(viewBtn);
      }
  
  
      //다운로드버튼
      if( params.useDown !== false ){
        let downBtn = document.createElement("button");
        downBtn.classList.add("btn","btn-down");
        if(uuid) downBtn.classList.add(...(params.clsFile||'_').split(/[, ]/));
        if(!uuid) downBtn.classList.add(...(params.clsnFile||'_').split(/[, ]/));
        let iconcls = params.clsDown||"fa-solid fa-download";
        downBtn.innerHTML = `<i class="${iconcls}"></i>`;
        downBtn.addEventListener("click",function(e){
          e.preventDefault();
          if(params?.downFunc){ params.downFunc(e, cell, params); return; }
        });
        
        fileBox.appendChild(downBtn);
      }
      
      
      //업로드버튼
      if( params.useUp !== false ){
        let lblFile = document.createElement("label");
        lblFile.classList.add("btn","lbl-down");
        if(uuid) lblFile.classList.add(...(params.clsFile||'_').split(/[, ]/));
        if(!uuid) lblFile.classList.add(...(params.clsnFile||'_').split(/[, ]/));
        let iconcls = params.clsUp||"fa-solid fa-upload";
        lblFile.innerHTML = `<i class="${iconcls}"></i>`;
        lblFile.addEventListener("change",function(e){
          e.preventDefault();
          if(params?.uploadFunc){
            params.uploadFunc(e, cell, params);
            const labelBtn = cell.getElement().querySelector('label');
            labelBtn.classList.add('upload');
            return;
          }
  
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result;
            cell.setValue({
              type: file.type,
              name: file.name,
              size: file.size,
              base64: base64data,
            }); //첨부파일종류
            lblFile.classList.add(...(params.clsFile||'_').split(/[, ]/));
          };
          reader.readAsDataURL(file);
        });
  
        //파일등록용 input
        let iptFile = document.createElement("input");
        iptFile.setAttribute("type", "file");
        lblFile.appendChild(iptFile);
  
        fileBox.appendChild(lblFile);
      }
  
      return fileBox;
    },
  
    formatterRowCommon: function( row ){
      row.getElement().classList.remove("new-row");
      row.getElement().classList.remove("mod-row");
      row.getElement().classList.remove("remove-row");
  
      switch( row._row.data._STATUS_ ){
        case "I" :
          row.getElement().classList.add("new-row"); /* 신규 Row 등록시 CSS 추가 */
        break;
        case "U" :
          row.getElement().classList.add("mod-row"); /* Row 수정시 CSS 추가 */
        break;
      }
  
      if( row._row.data.Del_Check === "Y" ){
        row.getElement().classList.add("remove-row"); /* Row 삭제시 CSS 추가 */
      }
    },
    rowformatterCommon: this.formatterRowCommon,
  
    openLoading: function( tbl, timeout ){
      if( tb_common_functions.preventDupExecute( tbl, 'S', 1000 ) ) { return; }
      let talert = window.setTimeout(function () { tbl.alert("Loading ...") }, timeout ); //1초 이상 지연되면 로딩 출력
      return talert;
    },
  
    closeLoading: function( tbl, talert ){
      window.clearTimeout(talert);
      tbl.clearAlert();
      tb_common_functions.preventDupExecute( tbl, 'E' );
    },
  
    //중복실행 방지
    preventDupExecute: function( tbl, mode ) {
      switch( mode ){
        case 's':
        case 'S':
          if( !tbl.exemode ){
            tbl.exemode = true;
            return false;
          }
          return true;
        case 'e':
        case 'E':
          tbl.exemode = false;
          break;
      }
  
    },
  
    editorSelect: function(cell, onRendered, success, cancel, editorParams){
      let edSelect = document.createElement("select");
      let params = editorParams.values;
      params = params || {};
      Object.keys(params).forEach(key => {
        let edOption = document.createElement("option");
        edOption.value = key;
        edOption.text = params[key];
        edSelect.append(edOption);
      });
      edSelect.className = 'form-select form-select-sm';
      edSelect.value = cell._cell.value;
      onRendered(function() {
        edSelect.focus();
      });
  
      let cback = function(){
        success( edSelect.value);
      }
  
      edSelect.addEventListener("change", cback);
      edSelect.addEventListener("blur", cback);
  
      return edSelect;
    },
  
    editorGrpSelect: function(cell, onRendered, success, cancel, editorParams){
      let edSelect = document.createElement("select");
      let params = editorParams.values;
      console.log(editorParams);
      params = params || {};
      params.forEach(optg => {
        let edOptGrp = document.createElement("optgroup");
        edOptGrp.label = optg.name;
        Object.keys(optg.options).forEach( k => {
          let edOption = document.createElement("option");
          edOption.value = k;
          edOption.text = optg.options[k];
          edOptGrp.append(edOption);
        } );
        edSelect.append(edOptGrp);
      });
      //edSelect.className = 'form-select form-select-sm';
      edSelect.value = cell._cell.value;
      edSelect.classList.add("chosen");
      onRendered(function() {
        edSelect.focus();
        edSelect.style.width='100%';
      });
  
      let cback = function(){
        success(
          editorParams.cfunc ? editorParams.cfunc(cell, edSelect.value) : edSelect.value
        );
      }
  
      edSelect.addEventListener("change", cback);
      edSelect.addEventListener("blur", cback);
      return edSelect;
    },
  
    //필드 입력폼 (날짜입력)
    editorDate: function(cell, onRendered, success, cancel, editorParams) {
      let dateInput = document.createElement("input");
      dateInput.setAttribute("type", "date");
      dateInput.className = 'px-2 w-100';
      dateInput.value = cell._cell.value;
      onRendered(function() {
        dateInput.focus();
      });
  
      let cback = function(){
        success( (dateInput.value ? luxon.DateTime.fromISO(dateInput.value).toFormat('yyyy-MM-dd') : "") );
      }
  
      dateInput.addEventListener("change", cback);
      dateInput.addEventListener("blur", cback);
  
      return dateInput;
    },
  
    //필드 입력폼 (월/년도)
    editorMonth: function(cell, onRendered, success, cancel, editorParams) {
      let dateInput = document.createElement("input");
      new Cleave(dateInput, {
        date: true,
        datePattern: ['m', 'Y'],
        delimiter: '/'
      });
  
      // dateInput.setAttribute("type", "date");
      dateInput.className = 'px-2 w-100';
      dateInput.value = cell._cell.value;
      onRendered(function() {
        dateInput.focus();
      });
  
      let cback = function(){
        success( dateInput.value);
      }
  
      dateInput.addEventListener("change", cback);
      dateInput.addEventListener("blur", cback);
  
      return dateInput;
    },
  
    //필드 입력폼 (텍스트입력)
    editorString: function(cell, onRendered, success, cancel, editorParams) {
      let stringInput = document.createElement("input");
      stringInput.setAttribute("type", "textarea");
      // stringInput.className = 'px-2 w-100';
      stringInput.value = cell._cell.value;
      onRendered(function() {
        stringInput.focus();
      });
  
      let cback = function(){
        success( stringInput.value);
      }
  
      stringInput.addEventListener("change", cback);
      stringInput.addEventListener("blur", cback);
  
      return stringInput;
    },
  
    editorNumeric : function numberEditor(cell, onRendered, success, cancel, editorParams) {
      let ipt = document.createElement("input");
      ipt.type = "number";
      ipt.style.width = '100%';
      ipt.value = cell.getValue()||'';
  
      ipt.addEventListener("blur", function() {
        success(ipt.value);
      });
  
      ipt.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          success(ipt.value);
        } else if (e.key === "Escape") {
          cancel();
        }
      });
  
      onRendered(function() {
        ipt.focus();
      });
  
      return ipt;
    },
  
    //Tabulator to Excel
    tabu2xls: function( tab_table, filename, title, udata ){
      //let header = tab_table.options.columns.filter(v=>v.visible != false && v.field != undefined).map(s=>({key:s.field, width:Math.round(((s.minWidth||s.width.replace(/[^0-9]/,''))||100)/6), title:s.title}));
      //width %는 고려하지 않음
      let header = tab_table.options.columns.filter(v=>v.visible != false && v.field != undefined && !v.noxls)
        .reduce( (retv,row) => {
          if( row.columns ){
            row.columns.filter(v=>v.visible != false && v.field != undefined && !v.noxls).forEach(crow => {
              retv.push({
                key  : crow.field,
                width: Math.round(((crow.minWidth||crow.width.replace(/[^0-9]/,'')*10)||100)/6),
                title: crow.title.replaceAll('<br>',''),
              });
            });
          }else{
            retv.push({
              key  : row.field,
              width: Math.round(((row.minWidth||row.width.replace(/[^0-9]/,'')*10)||100)/6),
              title: row.title.replaceAll('<br>',''),
            });
          }
          return retv;
        }, [] );
  
      let datas = udata || tab_table.getData("active").map(data => header.map(s=>s.key).reduce((ov,cv) => ({...ov, [cv]:(data[cv]||"")}), {})); //"active" <= filtered 된 데이터만 가져온다.
  
      json2xls(filename, title, header, datas);
    },
  
  
    //Row checked class Toggle
    toggleRowChecked: function( tgt, row ){
      if( typeof tgt == "object" ){
        row = tgt;
        row.parent.element.querySelectorAll(".tabulator-table .tabulator-row.tabulator-checked").forEach(tgt => tgt.classList.remove("tabulator-checked"));
      }else{
        document.querySelectorAll(tgt + " .tabulator-table .tabulator-row.tabulator-checked").forEach(tgt => tgt.classList.remove("tabulator-checked"));
      }
      if( row != undefined ){
        row.element.classList.add("tabulator-checked");
      }
    },
  
  
  }; // tb_common_functions end
  
  
  // 다우정밀 전용 타블레이터 함수
  const daou = {
    
    formatterNumber: function(cell, params){
      const digit = params.digit ?? 0;
      return cell.getValue() ? cell.getValue().toNum(digit).toLocaleString() : '';
    },
    // 숫자만 입력가능 params에 소숫점 입력가능
    editorNumber: function(cell, onRendered, success, cancel, editorParams) {
      const input = document.createElement("input");
      const digit = editorParams.digit ?? 0;
      const nullVal = editorParams.nullVal ?? null;
  
      input.value = cell.getValue();
      const delNoNum = function(){
        input.value = input.value.replaceAll(/[^0-9.-]/g,'');
      };
  
      delNoNum();
  
      input.style.width = '100%';
  
      onRendered(function() {
        input.focus();
      });
      
  
      const cback = function(){
        delNoNum();
        const ival = String(input.value) ? input.value.toNum(digit) : nullVal;
        success(ival);
      }
      
      input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          cback();
        } else if (e.key === "Escape") {
          cancel();
        }
      });
      input.addEventListener("input", delNoNum);
      input.addEventListener("change", cback);
      input.addEventListener("blur", cback);
  
      return input;
    },
  
    // #region [사용: MC2200]
  
    // formatterParams: { checkPoint: 'TGT_TYPE', listData: [{val: 'WH', values: varsWH_CD}, {val: 'BP', values: varsBP}] } } 
    ctFormatter: function (cell, formatterParams) {
      const rowData = cell.getData();
      const value = cell.getValue();
      let isList = false;
      for(let d of formatterParams['listData']){
        isList = rowData[formatterParams["checkPoint"]] === d['val'];
        if(isList){return d['values'][value];}
      }
      return value;
    },
    // editorParams: { checkPoint: 'TGT_TYPE', editors: [{editor: 'input', checkPoint: '*'}, {editor: 'list', checkPoint: 'WH', options: varsWH_CD}, ...] } 
    ctEditor: function(cell, onRendered, success, cancel, editorParams) {
      
      const rowData = cell.getData();
      const checkPoint = rowData[editorParams.checkPoint];
      const editors = editorParams.editors;
      const cellEl = cell.getElement();
      cellEl.classList.remove('user-list');
    
      const cellValue = cell.getValue() ? cell.getValue() : ""; // 현재 셀의 값을 가져옵니다.
      let input; // 조건에 따라 생성될 입력 요소
      let params = {};
    
      for( let info of editors){
        if(info['checkPoint'] === checkPoint){
          params = {key: info['editor'], value : {checkPoint : info['checkPoint'], options: info['options']}};
          break;
        }
      }
    
      switch(params.key){
        case "input":
          input = document.createElement("input");
          input.setAttribute("type", "text");
          input.value = cellValue;
        break;
    
        case 'list':
          const options = params.value.options;
          input = document.createElement("select");
          cellEl.classList.add("user-list");
      
          Object.entries(options).forEach(([key, val])=>{
            var optionElement = document.createElement("option");
            optionElement.value = key;
            optionElement.text = val;
            optionElement.selected = cellValue === key;
  
            input.appendChild(optionElement);
          })
        break;
    
        default:
          input = document.createElement("div");
        break;
      }
    
      input.style.width = "100%";
    
      onRendered(function () {
        input.focus();
        input.style.height = "100%";
      });
    
      function successFunc() {
        success(input.value); // 성공 콜백에 값을 전달하여 셀을 업데이트합니다.
      }
    
      input.addEventListener("change", successFunc);
      input.addEventListener("blur", successFunc);
    
      return input;
    },
  
    // 다른 CELL의 값으로 SELECT BOX 옵션 검색.
    // formatterParams: { checkPoint: 'WH_CD', listOptions: {WH_CD1:{LOC_CD1: LOC_NM1, ...}, WH_CD2:{...}, ...} } 
    formatterCtList: function (cell, formatterParams) {
      const rowData = cell.getData();
      const checkPoint = rowData[formatterParams["checkPoint"]];
      const value = cell.getValue();
  
      if(checkPoint){
        return formatterParams['listOptions'][checkPoint][value];
      }
    },
  
    // editorParams: {} : value_type 또는 spec_type - 수정 가능할것
    editorNumORChk: function(cell, onRendered, success, cancel, editorParams) {
      const valueType = cell.getData()['VALUE_TYPE'];
      const cellEl = cell.getElement();
      const cval = cell.getValue();
      let input;
      switch(valueType){
        case "VAL":
          cellEl.classList.remove('user-list');
          // input = document.createElement('input');
          // input.value = cval;
          return daou.editorNumber(cell, onRendered, success, cancel, editorParams);
  
        case "JUD":
          cellEl.classList.add('user-list');
          input = document.createElement('select');
  
          const opt1 = document.createElement('option')
          opt1.value = 'Y';
          opt1.text = '합격';
  
          const opt2 = document.createElement('option')
          opt2.value = 'N';
          opt2.text = '불합격';
  
          input.appendChild(opt1);
          input.appendChild(opt2);
  
          if(cval !== 'N'){
            opt2.selected = true;
          }else{
            opt1.selected = true;
          }
  
          input.style.width = '100%';
      
          onRendered(function () {
            input.focus();
            input.style.height = "100%";
          });
        
          function successFunc() {
            success(input.value); // 성공 콜백에 값을 전달하여 셀을 업데이트합니다.
          }
        
          input.addEventListener("change", successFunc);
          input.addEventListener("blur", successFunc);
        
          return input;
      }
    },
  
    formatterNumORChk: function(cell, formatterParams){
      const valueType = cell.getData()['VALUE_TYPE'];
      const cval = cell.getValue();
  
      if(valueType === 'VAL'){
        return cval?.toNumStr();
      }else if(valueType === 'JUD'){
        return cval ? (cval === 'Y' ? '합격' : '불합격') : '';
      }
    },
    // editorParams: { checkPoint: 'WH_CD', listOptions: { WH_CD1: {LOC_CD1: LOC_NM1, ...}, WH_CD2:{...}, ...} } 
    editorCtList: function(cell, onRendered, success, cancel, editorParams) {
      
      const rowData = cell.getData();
      const checkPoint = rowData[editorParams.checkPoint];
      const cellEl = cell.getElement();
      cellEl.classList.add("user-list");
    
      const cellValue = cell.getValue() ? cell.getValue() : ""; // 현재 셀의 값을 가져옵니다.
      const input = document.createElement("select");
      input.style.width = "100%";
        
      const options = editorParams.listOptions[checkPoint];
      if(options){
        Object.entries(options).forEach(([key,val])=>{
          var optionElement = document.createElement("option");
          optionElement.value = key;
          optionElement.text = val;
          optionElement.selected = cellValue === key;
    
          input.appendChild(optionElement);
        });
      }
    
      onRendered(function () {
        input.focus();
        input.style.height = "100%";
      });
    
      function successFunc() {
        success(input.value); // 성공 콜백에 값을 전달하여 셀을 업데이트합니다.
      }
    
      input.addEventListener("change", successFunc);
      input.addEventListener("blur", successFunc);
    
      return input;
    },
  
    // #endregion
  
    // 추가 시에만 user-editable을 붙이고 싶을때
    // formatter: daou.formatterOnlyInput, formatterParams: { formatter: tb_common_functions.formatterSelectList, params: { values: varsITEM } }
    formatterOnlyInput: function (cell, formatterParams) {
      const cellEl = cell.getElement();
      const rowData = cell.getData();
  
      if(rowData['ROW_STATUS'] !== 'I'){
        cellEl.classList.remove('user-editable')
      }else{
        cellEl.classList.add('user-editable')
      }
      if(formatterParams.formatter){
        return formatterParams.formatter(cell, formatterParams.params);
      }
      return cell.getValue();
    },
  
    // 특정 조건에만 user-editable을 붙이고 싶을때
    // formatter: daou.formatterOnlyInput, formatterParams: { editable: (rowData)=>{}, formatter: tb_common_functions.formatterSelectList, params: { values: varsITEM } }
    formatterOnly: function (cell, formatterParams) {
      const cellEl = cell.getElement();
      const rowData = cell.getData();
      const isEditable = formatterParams.editable(rowData);
  
      if(isEditable){
        cellEl.classList.add('user-editable')
      }else{
        cellEl.classList.remove('user-editable')
      }
      if(formatterParams.formatter){
        return formatterParams.formatter(cell, formatterParams.params);
      }
      return cell.getValue();
    },
  
    // formatterPop: function(cell, formatterParams) {
    //   const cval   = cell.getValue();
  
    //   const div = document.createElement('div');
  
    //   const input = document.createElement('input');
    //   input.type = "text";
  
    //   if(formatterParams.values){
    //     // formatterselectlist
    //     input.hidden = 'true';
    //     // 보이는 값
    //     const showInput = document.createElement('input');
    //     showInput.type = 'text';
  
    //     showInput.addEventListener('input', (e)=>{
    //       console.log(e.target.value);
    //       input.value = e.target.value;
    //       console.log(input.value);
    //       console.log(input);
    //     });
    //     showInput.addEventListener('change', (e)=>{
    //       const value = formatterParams.values[input.value];
    //       if(!value){
    //         input.value = null;
    //         cell.setValue(null);
    //         showInput.value = null;
    //         kuls_alert('')
    //       }
    //       showInput.value = formatterParams.values[input.value];
    //     });
  
    //     div.appendChild(showInput);
    //   }
    //   // cell에 값 바인딩 그대로
    //   input.value = cval;
    //   input.addEventListener('change',(e)=>{
    //     cell.setValue(e.target.value);
    //   })
  
    //   const popBtn = document.createElement('button');
    //   popBtn.classList.add('popup-btn');
    //   popBtn.innerHTML = `<i class="ksicon ksicon-srch"></i>`;
    //   popBtn.addEventListener('click', e=>formatterParams.popFun(cell));
  
    //   div.appendChild(input);
    //   div.appendChild(popBtn);
  
    //   return div;
    // },
   /**
   * datetime 형식에서 시간:분 추출하는 포맷터
   * @param {Object} cell - 테이블 셀 객체
   * @returns {string} HH:mm 형식의 시간
   */
    formatterTime: function(cell) {
      const value = cell.getValue();
      console.log(value);
      if (!value) return "";
    
      // datetime 문자열에서 시간과 분 추출
      const date = new Date(value);
      if (isNaN(date)) return value;
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
  
    /**
     * 행 합계 포매터. 01부터 31 컬럼까지의 합계를 계산. 해당 테이블은 01부터 31까지의 컬럼이 존재해야함
     * @param {Object} cell - 테이블 셀 객체
     * @returns {string} 합계 값
     */
    formatterRowSum: function(cell){
      let row = cell.getRow();
      let rowData = row.getData();
      let sum = 0;
      
      // 01부터 31까지의 모든 일자 컬럼의 값을 합산
      for(let i = 1; i <= 31; i++) {
          let day = String(i).padStart(2, '0');
          if(rowData[day] !== undefined && rowData[day] !== null) {
              console.log(rowData[day]);
              sum += Number(rowData[day]);
          }
      }
      
      return sum.toLocaleString();
    },
    customSelectEditor: function (cell, onRendered, success, cancel, editorParams) {
      const container = document.createElement("div");
      container.style.cssText = `
        position: fixed;
        z-index: 99999;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        overflow: hidden;
        min-width: 200px;
      `;
  
      // 검색 입력창
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.style.cssText = `
        width: 100%;
        box-sizing: border-box;
        padding: 8px 12px;
        border: none;
        border-bottom: 1px solid #eee;
        font-size: 14px;
        outline: none;
      `;
  
      // 선택 해제 버튼
      const clearBtn = document.createElement("button");
      clearBtn.textContent = "선택 해제";
      clearBtn.style.cssText = `
        display: block;
        width: calc(100% - 16px);
        margin: 4px 8px;
        padding: 6px 8px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: #f8f8f8;
        color: #555;
        cursor: pointer;
        font-size: 13px;
      `;
  
      // 옵션 리스트 컨테이너
      const listBox = document.createElement("div");
      listBox.style.cssText = `
        max-height: 200px;
        overflow-y: auto;
      `;
  
      container.appendChild(searchInput);
      container.appendChild(clearBtn);
      container.appendChild(listBox);
  
      // 상태 변수들
      let allOptions = [];
      let filteredOptions = [];
      let selectedIdx = -1;
      let isActive = true;
      let searchText = "";
  
      // 옵션 데이터 준비
      const prepareOptions = () => {
        let options = editorParams.values || [];
        if (typeof options === "function") {
          options = options(cell) || [];
        }
  
        if (typeof options === "object" && !Array.isArray(options)) {
          options = Object.entries(options).map(([key, val]) => ({
            value: key,
            label: val,
          }));
        }
  
        allOptions = options.map((item) => {
          if (typeof item === "object" && item !== null) {
            return {
              value: item.value !== undefined ? item.value : JSON.stringify(item),
              label:
                item.label !== undefined
                  ? String(item.label)
                  : String(item.value || item),
            };
          }
          return { value: item, label: String(item) };
        });
      };
  
      // 필터링 및 리스트 렌더링
      const renderList = () => {
        const filter = searchText.toLowerCase().trim();
        filteredOptions = allOptions.filter((opt) =>
          opt.label.toLowerCase().includes(filter)
        );
  
        listBox.innerHTML = "";
        selectedIdx = -1;
  
        filteredOptions.forEach((option, index) => {
          const item = document.createElement("div");
          item.textContent = editorParams.showKeyValue
            ? `${option.label} (${option.value})`
            : option.label;
          item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            white-space: nowrap;
            font-size: 14px;
            background: white;
            color: #000;
          `;
  
          // 데이터 속성으로 값 저장
          item.setAttribute("data-value", option.value);
          item.setAttribute("data-index", index);
  
          // 마우스 호버 이벤트
          item.addEventListener("mouseenter", () => {
            if (!isActive) return;
            updateSelection(index);
          });
  
          // 마우스 클릭 이벤트 - click 대신 mouseup 사용
          item.addEventListener("mouseup", (e) => {
            if (!isActive) return;
            e.preventDefault();
            e.stopPropagation();
            selectOption(option.value);
          });
  
          listBox.appendChild(item);
        });
  
        // 현재 셀 값이 필터된 옵션에 있으면 선택
        const currentValue = cell.getValue();
        const currentIndex = filteredOptions.findIndex(
          (opt) => opt.value === currentValue
        );
        if (currentIndex !== -1) {
          updateSelection(currentIndex);
        } else if (filteredOptions.length > 0 && filter) {
          updateSelection(0);
        }
      };
  
      // 선택 상태 업데이트
      const updateSelection = (index) => {
        // 이전 선택 해제
        const prevSelected = listBox.querySelector(".selected");
        if (prevSelected) {
          prevSelected.style.background = "white";
          prevSelected.style.color = "#000";
          prevSelected.classList.remove("selected");
        }
  
        selectedIdx = index;
  
        if (index >= 0 && index < filteredOptions.length) {
          const items = listBox.children;
          if (items[index]) {
            items[index].style.background = "#f0f0f0";
            items[index].style.color = "#333";
            items[index].classList.add("selected");
            items[index].scrollIntoView({ block: "nearest" });
          }
        }
      };
  
      // 옵션 선택
      const selectOption = (value) => {
        if (!isActive) return;
        cleanup();
        success(value);
      };
  
      // 에디터 닫기
      const closeEditor = () => {
        if (!isActive) return;
        cleanup();
        cancel();
      };
  
      // 정리 작업
      const cleanup = () => {
        isActive = false;
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        document.removeEventListener("mousedown", handleOutsideClick, true);
        document.removeEventListener("keydown", handleGlobalKeys, true);
      };
  
      // 외부 클릭 처리
      const handleOutsideClick = (e) => {
        if (!container.contains(e.target)) {
          closeEditor();
        }
      };
  
      // 전역 키보드 이벤트
      const handleGlobalKeys = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          closeEditor();
        }
      };
  
      // 검색 입력 이벤트 - input 이벤트만 사용
      let inputTimer = null;
      searchInput.addEventListener("input", (e) => {
        if (!isActive) return;
  
        // 디바운싱으로 성능 최적화
        clearTimeout(inputTimer);
        inputTimer = setTimeout(() => {
          searchText = e.target.value;
          renderList();
        }, 100);
      });
  
      // 키보드 네비게이션
      searchInput.addEventListener("keydown", (e) => {
        if (!isActive) return;
  
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            if (selectedIdx >= 0 && selectedIdx < filteredOptions.length) {
              selectOption(filteredOptions[selectedIdx].value);
            } else if (filteredOptions.length > 0) {
              selectOption(filteredOptions[0].value);
            } else if (editorParams.allowFreeInput) {
              selectOption(searchInput.value);
            } else {
              closeEditor();
            }
            break;
  
          case "ArrowDown":
            e.preventDefault();
            if (filteredOptions.length > 0) {
              const newIdx =
                selectedIdx < filteredOptions.length - 1 ? selectedIdx + 1 : 0;
              updateSelection(newIdx);
            }
            break;
  
          case "ArrowUp":
            e.preventDefault();
            if (filteredOptions.length > 0) {
              const newIdx =
                selectedIdx > 0 ? selectedIdx - 1 : filteredOptions.length - 1;
              updateSelection(newIdx);
            }
            break;
  
          case "Escape":
            e.preventDefault();
            closeEditor();
            break;
        }
      });
  
      // 선택 해제 버튼
      clearBtn.addEventListener("mouseup", (e) => {
        if (!isActive) return;
        e.preventDefault();
        e.stopPropagation();
        selectOption("");
      });
  
      // 포커스 잃을 때 처리
      searchInput.addEventListener("blur", (e) => {
        // 약간의 지연을 두어 마우스 클릭이 처리될 시간을 줌
        setTimeout(() => {
          if (isActive && !container.contains(document.activeElement)) {
            if (editorParams.allowFreeInput) {
              selectOption(searchInput.value);
            } else {
              closeEditor();
            }
          }
        }, 150);
      });
  
      // 초기화 및 렌더링
      onRendered(() => {
        prepareOptions();
  
        // 위치 계산
        const cellRect = cell.getElement().getBoundingClientRect();
        const winHeight = window.innerHeight;
        const winWidth = window.innerWidth;
  
        document.body.appendChild(container);
  
        // 초기 렌더링
        renderList();
  
        // 크기 계산
        const containerHeight = container.offsetHeight;
        const containerWidth = Math.max(
          container.offsetWidth,
          cellRect.width,
          200
        );
  
        // 위치 결정
        let top = cellRect.bottom;
        let left = cellRect.left;
  
        // 화면 아래로 벗어나면 위쪽에 표시
        if (top + containerHeight > winHeight) {
          top = cellRect.top - containerHeight;
          if (top < 0) {
            top = 5;
            listBox.style.maxHeight = `${winHeight - 100}px`;
          }
        }
  
        // 화면 오른쪽으로 벗어나면 조정
        if (left + containerWidth > winWidth) {
          left = winWidth - containerWidth - 5;
        }
        if (left < 5) left = 5;
  
        container.style.left = `${left}px`;
        container.style.top = `${top}px`;
        container.style.minWidth = `${containerWidth}px`;
  
        // 포커스 및 이벤트 리스너 등록
        searchInput.focus();
        document.addEventListener("mousedown", handleOutsideClick, true);
        document.addEventListener("keydown", handleGlobalKeys, true);
      });
  
      return container;
    },
    getExcel(title,fields,addData) {
      const visibleFields = fields.filter(field => field.visible !== false);
      // 테이블의 field 정보 가져오기
      let sheet_title = title;
      let file_name = title;
    
      const work_Book = new ExcelJS.Workbook();
      const work_Sheet = work_Book.addWorksheet(sheet_title);
    
      const all_border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    
      const field_css = {
        blue: {
          border: all_border,
          font: { font: { size: 11 }, color: { argb: "0E3979" }, bold: true },
          alignment: { vertical: "middle", horizontal: "center" },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "EAEFF3" },
          }
        },
        box: {
          border: all_border,
          alignment: { vertical: "middle", horizontal: "center" },
          font: { size: 11 },
        }
      };
    
      // 헤더 행 설정
      let ws_row = work_Sheet.getRow(1);
      ws_row.height = 25;
    
      // 필드 정보를 기반으로 헤더 생성
      visibleFields.forEach((field, index) => {
        if (field.title) {  // title이 있는 필드만 처리
          ws_row.getCell(index + 1).style = field_css.blue;
          // if(field.title !== '사용' && field.title !== '삭제' && field.title !== '팝업'){
            ws_row.getCell(index + 1).value = field.title;
        }
      });
  
      // 데이터 추가
      // console.log(addData);
      addData.forEach((row, idx) => {
        const ws_row = work_Sheet.getRow(idx + 2);
        visibleFields.forEach((field, index) => {
          if (field.title) {  // title이 있는 필드만 처리
            ws_row.getCell(index + 1).style = field_css.box;
            ws_row.getCell(index + 1).value = row[field.field];
          }
        });
      });
  
      // 컬럼 너비 설정
      work_Sheet.columns = visibleFields.map(field => ({
        
        width: field.minWidth ? field.minWidth / 7 : 15  // minWidth가 있으면 사용, 없으면 기본값 15
  
      }));
    
      // 파일 생성 및 다운로드
      work_Book.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${file_name}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    },
    //Validation 관련 공통 함수들
    validation: {
      /**
       * 사전 정의된 패턴들 (정규식만 저장)
       * 
       * 사용법:
       * 1. Preset 패턴만:
       *    { type: 'pattern', params: { preset: 'phone' } }
       * 2. Preset + 커스텀 메시지:
       *    { type: 'pattern', params: { preset: 'phone', message: '전화번호를 입력하세요' } }
       * 3. 직접 패턴 (기존 방식):
       *    { type: 'pattern', params: { pattern: '^\\d+$', message: '숫자만 입력하세요' } }
       */
      patterns: {
        phone: '^(\\d{2,3}-\\d{3,4}-\\d{4}|\\d{10,11})$',          // 일반전화/휴대폰
        mobile: '^(010-\\d{4}-\\d{4}|010\\d{8})$',                 // 휴대폰만
        email: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',                   // 이메일
        zipcode: '^\\d{5}$',                                       // 5자리 우편번호
        bizNumber: '^\\d{3}-\\d{2}-\\d{5}$',                       // 사업자등록번호
        alphanumeric: '^[A-Za-z0-9]+$',                            // 영문+숫자
        alphanumericWithHyphen: '^[A-Za-z0-9\\s-]+$',              // 영문+숫자+하이픈
        korean: '^[가-힣\\s]+$',                                    // 한글만
        englishOnly: '^[A-Za-z\\s]+$',                             // 영문만
        numberOnly: '^\\d+$',                                      // 숫자만
        containerNumber: '^[A-Z]{4}\\d{7}$',                       // 컨테이너번호
        vesselCode: '^[A-Za-z0-9\\s-]+$',                          // 선박코드
        vehicleNumber: '^\\d{2}[가-힣]\\s?\\d{4}$'                  // 차량번호
      },
  
      // 필수값 체크
      required: function(value, params) {
        if (value === null || value === undefined || value === '') {
          return { valid: false, message: params?.message || '필수 입력값입니다.' };
        }
        return { valid: true };
      },
  
      // 숫자 체크
      number: function(value, params) {
        if (value === null || value === undefined || value === '') {
          return { valid: true }; // 빈값은 허용 (required와 별도 체크)
        }
        
        const num = Number(value);
        if (isNaN(num)) {
          return { valid: false, message: params?.message || '숫자만 입력 가능합니다.' };
        }
        
        // 최소값 체크
        if (params?.min !== undefined && num < params.min) {
          return { valid: false, message: `${params.min} 이상의 값을 입력해주세요.` };
        }
        
        // 최대값 체크
        if (params?.max !== undefined && num > params.max) {
          return { valid: false, message: `${params.max} 이하의 값을 입력해주세요.` };
        }
        
        return { valid: true };
      },
  
      // 문자열 길이 체크
      length: function(value, params) {
        if (value === null || value === undefined) {
          return { valid: true };
        }
        
        const str = String(value);
        
        // 최소 길이 체크
        if (params?.min !== undefined && str.length < params.min) {
          return { valid: false, message: `최소 ${params.min}자 이상 입력해주세요.` };
        }
        
        // 최대 길이 체크
        if (params?.max !== undefined && str.length > params.max) {
          return { valid: false, message: `최대 ${params.max}자까지 입력 가능합니다.` };
        }
        
        return { valid: true };
      },
  
      // 정규식 패턴 체크 (preset 패턴 또는 custom 패턴 지원)
      pattern: function(value, params) {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        
        let pattern = '';
        let message = '';
        
        // preset 패턴 사용
        if (params.preset) {
          pattern = daou.validation.patterns[params.preset];
          if (pattern) {
            message = params.message || '형식이 올바르지 않습니다.';
          } else {
            console.warn(`Unknown preset pattern: ${params.preset}`);
            return { valid: false, message: `알 수 없는 패턴: ${params.preset}` };
          }
        } 
        // 직접 패턴 사용 (기존 방식)
        else if (params.pattern) {
          pattern = params.pattern;
          message = params.message || '형식이 올바르지 않습니다.';
        } else {
          return { valid: false, message: 'pattern 또는 preset 파라미터가 필요합니다.' };
        }
        
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return { valid: false, message: message };
        }
        
        return { valid: true };
      },
  
      // 이메일 형식 체크
      email: function(value, params) {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, message: params?.message || '올바른 이메일 형식을 입력해주세요.' };
        }
        
        return { valid: true };
      },
  
      // 날짜 형식 체크
      date: function(value, params) {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { valid: false, message: params?.message || '올바른 날짜 형식을 입력해주세요.' };
        }
        
        // 최소 날짜 체크
        if (params?.min && new Date(value) < new Date(params.min)) {
          return { valid: false, message: `${params.min} 이후 날짜를 입력해주세요.` };
        }
        
        // 최대 날짜 체크
        if (params?.max && new Date(value) > new Date(params.max)) {
          return { valid: false, message: `${params.max} 이전 날짜를 입력해주세요.` };
        }
        
        return { valid: true };
      },
  
      // 중복값 체크 (같은 테이블 내)
      unique: function(value, params, cell) {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        
        const table = cell.getTable();
        const field = cell.getField();
        const currentRow = cell.getRow();
        
        const duplicateRow = table.getData().find(row => 
          row !== currentRow.getData() && 
          row[field] === value
        );
        
        if (duplicateRow) {
          return { valid: false, message: params?.message || '중복된 값입니다.' };
        }
        
        return { valid: true };
      },
  
      // 커스텀 validation 함수
      custom: function(value, params, cell) {
        if (typeof params.validator === 'function') {
          return params.validator(value, cell, params);
        }
        return { valid: true };
      }
    },
  
    // Validation 실행 함수
    validateCell: function(cell, validationRules) {
      if (!validationRules || validationRules.length === 0) {
        return { valid: true };
      }
  
      const value = cell.getValue();
      
      for (let rule of validationRules) {
        const validationFunc = daou.validation[rule.type];
        if (validationFunc) {
          const result = validationFunc(value, rule.params, cell);
          if (!result.valid) {
            return result;
          }
        }
      }
      
      return { valid: true };
    },
  
    // Validation 에러 스타일 적용
    applyValidationError: function(cell, message) {
      const cellElement = cell.getElement();
      
      // 더 강력한 CSS 클래스 적용 (clipboard/rangeSelection과 충돌 방지)
      cellElement.classList.add('tabulator-validation-error');
      cellElement.setAttribute('data-validation-error', 'true');
      cellElement.setAttribute('title', message);
      
      // 스타일을 인라인으로도 적용하여 다른 모듈의 영향 최소화
      const originalBorderColor = cellElement.style.borderColor;
      const originalBoxShadow = cellElement.style.boxShadow;
      const originalBg = cellElement.style.backgroundColor;
      
      // 행 높이 변경을 방지하기 위해 border-color와 box-shadow 사용
      cellElement.style.setProperty('border-color', '#f44336', 'important');
      cellElement.style.setProperty('box-shadow', 'inset 0 0 0 1px #f44336', 'important');
      cellElement.style.setProperty('background-color', '#ffebee', 'important');
      
      // 원본 스타일 저장
      cellElement.setAttribute('data-original-border-color', originalBorderColor);
      cellElement.setAttribute('data-original-box-shadow', originalBoxShadow);
      cellElement.setAttribute('data-original-bg', originalBg);
      
      // 강제 스타일 유지 함수 적용 (clipboard/rangeSelection 충돌 대응)
      daou.forceValidationStyle(cell, message);
    },
  
    // Validation 에러 스타일 제거
    removeValidationError: function(cell) {
      const cellElement = cell.getElement();
      
      // MutationObserver 정리
      daou.clearValidationObserver(cell);
      
      cellElement.classList.remove('tabulator-validation-error');
      cellElement.removeAttribute('data-validation-error');
      cellElement.removeAttribute('title');
      
      // 원본 스타일 복원
      const originalBorderColor = cellElement.getAttribute('data-original-border-color');
      const originalBoxShadow = cellElement.getAttribute('data-original-box-shadow');
      const originalBg = cellElement.getAttribute('data-original-bg');
      
      if (originalBorderColor !== null) {
        cellElement.style.borderColor = originalBorderColor;
        cellElement.removeAttribute('data-original-border-color');
      } else {
        cellElement.style.removeProperty('border-color');
      }
      
      if (originalBoxShadow !== null) {
        cellElement.style.boxShadow = originalBoxShadow;
        cellElement.removeAttribute('data-original-box-shadow');
      } else {
        cellElement.style.removeProperty('box-shadow');
      }
      
      if (originalBg !== null) {
        cellElement.style.backgroundColor = originalBg;
        cellElement.removeAttribute('data-original-bg');
      } else {
        cellElement.style.removeProperty('background-color');
      }
    },
  
    // Validation 스타일 강제 유지 함수 (clipboard/rangeSelection 모듈과의 충돌 대응)
    forceValidationStyle: function(cell, message) {
      const cellElement = cell.getElement();
      
      // MutationObserver를 사용하여 스타일 변경 감지 및 복원
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
            
            // validation 에러 속성이 있는데 스타일이 제거된 경우 복원
            if (cellElement.getAttribute('data-validation-error') === 'true') {
              if (!cellElement.classList.contains('tabulator-validation-error')) {
                cellElement.classList.add('tabulator-validation-error');
              }
              
              // 인라인 스타일도 강제 복원 (행 높이 변경 방지)
              if (!cellElement.style.borderColor.includes('#f44336')) {
                cellElement.style.setProperty('border-color', '#f44336', 'important');
                cellElement.style.setProperty('box-shadow', 'inset 0 0 0 1px #f44336', 'important');
                cellElement.style.setProperty('background-color', '#ffebee', 'important');
              }
            }
          }
        });
      });
      
      // 셀 요소 변경 감지 시작
      observer.observe(cellElement, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      // observer를 셀 요소에 저장하여 나중에 정리할 수 있도록 함
      cellElement._validationObserver = observer;
    },
  
    // Validation observer 정리
    clearValidationObserver: function(cell) {
      const cellElement = cell.getElement();
      if (cellElement._validationObserver) {
        cellElement._validationObserver.disconnect();
        delete cellElement._validationObserver;
      }
    }
  }
  
// Export for module usage
export { tb_common_functions, daou };

// Make globally available for direct script inclusion
if (typeof window !== 'undefined') {
  window.tb_common_functions = tb_common_functions;
  window.daou = daou;
}