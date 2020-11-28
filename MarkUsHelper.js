// ==UserScript==
// @name     MarkUs helper
// @version  1
// @grant    none
// @match    https://markus.student.cs.uwaterloo.ca/*/submissions/*/results/*/edit
// ==/UserScript==

const save_wait_time_ms = 100;
const grade_incr_amount = 0.5;

function getAllMarks() {
    return [...document.querySelectorAll('[id^="mark_"]')].filter(ele => !isNaN(ele.id.toString().substr(5))).map(ele => document.querySelector('#' + ele.id))
}

/** Auto grade no submission */
async function gradeEmptySubmission() {
  function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
  if (document.querySelector('#select_file_id') && 
      document.querySelector('#select_file_id').selectedOptions.length == 1 && 
      document.querySelector('#select_file_id').selectedOptions[0].innerHTML == '[No files in repository]') {
    console.log('No files in repo');
    getAllMarks().forEach(ele => {
      ele.value = 0;
      let event = document.createEvent("Event");
      event.initEvent("change", false, true); 
      ele.dispatchEvent(event);
    });
    await sleep(save_wait_time_ms * 4);
    if (document.querySelector('#marking_state').selectedIndex == 0) {
      document.querySelector('#marking_state').selectedIndex = 2;
      let event = document.createEvent("Event");
      event.initEvent("change", false, true); 
      document.querySelector('#marking_state').dispatchEvent(event);
      await sleep(save_wait_time_ms);
      document.querySelector('#student_selector').children[2].children[0].click();
    }
  }
}
window.addEventListener('load', gradeEmptySubmission, false);

/** Scroll to enter grades */
function onWheelAddVal(e) {
  e.preventDefault();
  let originalVal = Number(e.target.value);
  if (originalVal == '') {
    originalVal = 0;
  }
  if (e.deltaY < 0) {
    originalVal += grade_incr_amount;
  } else {
    originalVal -= grade_incr_amount;
  }
  if (originalVal < 0) {
    originalVal = 0;
  }
  let max = Number(e.target.parentNode.children[1].innerHTML);
  if (originalVal > max) {
    originalVal = max;
  }
  e.target.value = originalVal;
  let event = document.createEvent("Event");
  event.initEvent("change", false, true); 
  e.target.dispatchEvent(event);
}

getAllMarks().forEach(ele => {
  ele.addEventListener('wheel', onWheelAddVal);
});

/** Scroll to select files */
document.querySelector('#select_file_id').addEventListener('wheel', function(e) {
  e.preventDefault();
  if (e.deltaY < 0) {
    document.querySelector('#back_button').click();
  } else {
    document.querySelector('#next_button').click();
  }
});

/** Scroll to set marking state */
document.querySelector('#marking_state').addEventListener('wheel', function(e) {
  e.preventDefault();
  let newIndex = document.querySelector('#marking_state').selectedIndex;
  if (e.deltaY < 0) {
    newIndex--;
  } else {
    newIndex++;
  }
  if (newIndex > 2) {
    newIndex = 2;
  }
  if (newIndex < 0) {
    newIndex = 0;
  }
  document.querySelector('#marking_state').selectedIndex = newIndex;
  let event = document.createEvent("Event");
  event.initEvent("change", false, true); 
  document.querySelector('#marking_state').dispatchEvent(event);
});
