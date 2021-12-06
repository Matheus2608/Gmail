//sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#uniqueEmail").style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  let recipients = document.querySelector("#compose-recipients");
  let subject = document.querySelector("#compose-subject");
  let body = document.querySelector("#compose-body");

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

  recipients.disabled = false
  subject.disabled = false
  // if email was passed as argument
  if (email.subject){
      recipients.value = email.sender
      if (!(email.subject.startsWith("Re: "))){
        console.log(email.subject)
        subject.value = "Re: " + email.subject
      }else{
        subject.value = email.subject;
      }
      recipients.disabled = true
      subject.disabled = true
      body.value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}\nReply:`
  }
  
  document.querySelector('#compose-form').onsubmit = () => {
    recipients = document.querySelector("#compose-recipients").value;
    subject = document.querySelector("#compose-subject").value;
    body = document.querySelector("#compose-body").value;

    fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result)
    alert(result);

});
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#uniqueEmail").style.display = 'none';

  // Show the mailbox name
  let emails_view = document.querySelector('#emails-view')
  emails_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //call the right function
  if (mailbox === "inbox") {
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        emailLink = makeEmailsDiv(email)
        console.log(emailLink)
        let button = document.createElement('button')
        button.innerHTML = "archive";
        button.className = "archive"
        button.addEventListener('click', async function(){
          fetch('/emails/' + email.id, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
            })
          })
          await sleep(100);
          load_mailbox('inbox')
      })
        emails_view.append(emailLink)
        emails_view.append(button)

      });
    });
  }
  else if(mailbox === "sent"){
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        let emailLink = makeEmailsDiv(email)
        emails_view.append(emailLink)
      });
    });
  }else{
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        let emailLink = makeEmailsDiv(email)
        emails_view.append(emailLink)
        let button = document.createElement('button')
        button.innerHTML = "unarchive"
        button.className = "archive"
        button.addEventListener('click', async function(){
          fetch('/emails/' + email.id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          })
          await sleep(100);
          load_mailbox('inbox')
        })
        emails_view.append(button)
      })
    })
  }
}

function viewEmail(emaiId){
  // Show the see-email div and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  
  let uniqueEmail = document.querySelector("#uniqueEmail")
  uniqueEmail.style.display = "block"

  // cleaning out the div
  uniqueEmail.innerHTML = ""

  fetch('/emails/' + emaiId)
  .then(response => response.json())
  .then(email => {
    //creating elements

    let uniqueEmailSender = document.createElement('p')
    uniqueEmailSender.innerHTML = `<strong>From:</strong> ${email.sender}`

    let uniqueEmailRecipient = document.createElement('p')
    uniqueEmailRecipient.innerHTML = `<strong>To</strong>: ${email.recipients}`

    let uniqueEmailSubject = document.createElement('p')
    uniqueEmailSubject.innerHTML = `<strong>Subject:</strong> ${email.subject}`

    let uniqueEmailTime = document.createElement('p')
    uniqueEmailTime.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`

    let hr = document.createElement('hr');

    let uniqueEmailBody = document.createElement('p')
    uniqueEmailBody.innerHTML = `${email.body}`

    let uniqueEmailReply = document.createElement('button')
    uniqueEmailReply.className = "btn btn-sm btn-outline-primary"
    uniqueEmailReply.innerHTML = "Reply"
    uniqueEmailReply.addEventListener('click', () => compose_email(email))
    //appending
    uniqueEmail.append(uniqueEmailSender)
    uniqueEmail.append(uniqueEmailRecipient)
    uniqueEmail.append(uniqueEmailSubject)
    uniqueEmail.append(uniqueEmailTime)
    uniqueEmail.append(uniqueEmailReply)
    uniqueEmail.append(hr)
    uniqueEmail.append(uniqueEmailBody)
});

  fetch('/emails/' + emaiId, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
    })
  })
  
}

function makeEmailsDiv(email){
  let emailDiv = document.createElement('div');
  emailDiv.className = "emails-div"
  if (email.read){
    emailDiv.style.backgroundColor = "gray"
  }

  let emailLink = document.createElement("a")
  //emailLink.href = ""
  emailLink.dataset.number = email.id
  // when the email is clicked
  emailLink.addEventListener('click', () => viewEmail(email.id))

  let emailHeading = document.createElement("h1")
  emailHeading.innerHTML = email.sender

  let emailBodyParagraph = document.createElement("p")
  emailBodyParagraph.className = "subject"
  emailBodyParagraph.innerHTML = email.subject

  let emailDateParagraph = document.createElement("p")
  emailDateParagraph.className = "date"
  emailDateParagraph.innerHTML = email.timestamp
  
  let button = document.createElement('button')
  button.innerHTML = "archive";
  button.className = "archive"
  button.addEventListener('click', async function(){
    fetch('/emails/' + email.id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
      })
    })
    await sleep(100);
    load_mailbox('inbox')
})
  emailDiv.append(emailHeading)
  emailDiv.append(emailBodyParagraph)
  emailDiv.append(emailDateParagraph)
  emailLink.append(emailDiv)

  return emailLink
  
}