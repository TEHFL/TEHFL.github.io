const CRM_SPREADSHEET_ID = '1gmhvNifax7SJj5p8iAZ7y_Gl4zRzeoHzIn_XDf93jH0';

function doGet() {
  return json_({ok:true, service:'TEHFL CRM Bridge'});
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || '';
    if (action === 'bootstrap') return json_({ok:true, data:bootstrap_()});
    if (action === 'addContact') return json_({ok:true, data:addContact_(body.contact || {})});
    return json_({ok:false, error:'Unsupported action'});
  } catch (err) {
    return json_({ok:false, error:String(err && err.message || err)});
  }
}

function bootstrap_() {
  const ss = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  const people = objects_(ss.getSheetByName('People'));
  const follow = objects_(ss.getSheetByName('Follow-Up'));
  const events = objects_(ss.getSheetByName('Events'));
  const activity = objects_(ss.getSheetByName('Activity Log'));
  const campaigns = objects_(ss.getSheetByName('Campaigns'));

  return {
    metrics: {
      totalPeople: people.filter(p => p.Email).length,
      signalRegistrants: people.filter(p => String(p['Program / Interest']||'').includes('SIGNAL')).length,
      needsFollowUp: people.filter(p => p['Follow-Up Status']==='Needs Follow-Up').length,
      highHot: people.filter(p => ['High','Hot'].includes(p.Priority)).length,
      attended: people.filter(p => p.Attendance==='Attended').length
    },
    people: people.map(p => ({
      id:p['Contact ID'], firstName:p['First Name'], lastName:p['Last Name'], email:p.Email, mobile:p.Mobile,
      lifecycle:p['Lifecycle Stage'], interest:p['Program / Interest'], source:p.Source, followUpStatus:p['Follow-Up Status'],
      owner:p.Owner, priority:p.Priority, tags:p.Tags, notes:p.Notes, nextStep:p['Next Step / Program']
    })),
    followup: follow.map(p => ({id:p['Contact ID'],name:p.Name,email:p.Email,mobile:p.Mobile,interest:p.Interest,status:p['Follow-Up Status'],nextFollow:p['Next Follow-Up'],owner:p.Owner,priority:p.Priority,nextStep:p['Next Step'],notes:p.Notes})),
    campaigns: campaigns,
    activity: activity,
    events: events
  };
}

function addContact_(c) {
  if (!c.firstName && !c.email) throw new Error('First name or email is required.');
  const ss = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  const sh = ss.getSheetByName('Contact Intake');
  const id = 'CRM-' + Utilities.getUuid().slice(0,8).toUpperCase();
  const now = new Date();
  sh.appendRow([
    id, now, c.firstName||'', c.lastName||'', c.email||'', c.mobile||'',
    'New', c.interest||'Other', 'CRM Dashboard', '', '', '', '', '',
    'Not Started', '', c.notes||'', '', 'Jaymie', '', '', '', now, '', c.interest||'', c.priority||'Normal',
    'Manual CRM Entry', ''
  ]);
  return {id:id};
}

function objects_(sheet) {
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(r => r.some(v => v !== '')).map(r => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = r[i] || '');
    return obj;
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}