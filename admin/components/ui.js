export function createOrderListItem(order, onSelect) {
  const li = document.createElement("li");
  li.innerHTML = `
    <div>${order.name}</div>
    <div class="order-meta">${new Date(order.created_at).toLocaleString()}</div>
  `;
  li.addEventListener("click", () => onSelect(order));
  return li;
}
