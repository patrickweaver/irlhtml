const secret = localStorage.getItem('secret')

async function main() {
  try {
    const response = await fetch("/api/pages");
    const data = await response.json();
    console.log("Page Count: ", data?.length);
    const pagesListItems = data.map((page) => {
      const { date_created, id, title } = page;
      const pageUrl = `/pages/${id}`;
      const pageTitleCopy = title ?? `Untitled - ${id.slice(0, 5)}`;
      let dateCopy = date_created;
      try {
        const dateOptions = {
          // timeStyle: "long",
          // dateStyle: "short",
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        };
        const dateFmt = new Intl.DateTimeFormat("en", dateOptions);
        dateCopy = dateFmt.format(new Date(date_created));
      } catch (error) {
        console.log(error);
      }
      const deleteButton = secret ? `<button onclick="deleteItem('${id}')">Delete</button>` : '';
      return `<li>${dateCopy}: <a href="${pageUrl}">${pageTitleCopy}</a> ${deleteButton}</li>`;
    });
    document.getElementById("pages-list").innerHTML = pagesListItems.join("");
  } catch (error) {
    console.log("** Error **");
    console.log(error);
    alert("Error" + JSON.stringify(error));
  }
}

async function deleteItem(id) {
  const proceed = confirm(`Do you want to delete: ${id}?`)
  if (!proceed) return;
  try {
    console.log("Deleting:", id);
    const response = await fetch(`/api/pages/${id}?secret=${secret}`, {
      method: "DELETE",
    });
    const data = await response.json();
    console.log({ data })
    if (data.status !== 'deleted') throw new Error(data.error)
    alert(`Successfully deleted ${id}`);
  } catch (error) {
    alert(`Error deleting ${id}`);
    
  }
  window.location.href = '/'
}

main();
