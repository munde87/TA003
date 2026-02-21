const API = "http://localhost:8000";
let uLat = 28.6139,
  uLng = 77.209,
  prods = [],
  cart = [],
  shopRes = [],
  map = null,
  markers = [],
  dirR = null,
  mOk = false,
  userMk = null;

window.addEventListener("DOMContentLoaded", () => {
  checkML();
  loadCart();
  renderCart();
  initMap();
  document.getElementById("si").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addProd();
  });
});
function mapsReady() {
  mOk = true;
  initMap();
}

// ── ML STATUS ──
async function checkML() {
  const e = document.getElementById("mlSt");
  try {
    const r = await (await fetch(API + "/health")).json();
    e.innerHTML = `<span class="dot on"></span>${r.cats.length} cats · ${r.shops} shops · ${r.products} products`;
  } catch {
    e.innerHTML = `<span class="dot off"></span>Offline`;
  }
}

// ── LOCATION ──
function getLoc() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      uLat = p.coords.latitude;
      uLng = p.coords.longitude;
      document.getElementById("locTx").textContent =
        `${uLat.toFixed(4)}, ${uLng.toFixed(4)}`;
      toast("Location detected!", "ok");
      if (map) {
        map.panTo({ lat: uLat, lng: uLng });
        placeUser();
      }
    },
    () => toast("Using Delhi", "inf"),
    { enableHighAccuracy: true, timeout: 8000 },
  );
}

// ── PRODUCTS ──
function addProd() {
  const i = document.getElementById("si"),
    v = i.value.trim().toLowerCase();
  if (!v) return;
  if (prods.includes(v)) {
    toast("Already added", "err");
    return;
  }
  prods.push(v);
  i.value = "";
  renderChips();
}
function qAdd(t) {
  if (!prods.includes(t)) {
    prods.push(t);
    renderChips();
  }
}
function rmProd(i) {
  prods.splice(i, 1);
  renderChips();
}
function renderChips() {
  document.getElementById("chips").innerHTML = prods
    .map(
      (p, i) =>
        `<span class="chip">${p}<b onclick="rmProd(${i})"> ×</b></span>`,
    )
    .join("");
  document.getElementById("fbtn").disabled = !prods.length;
}

// ── SEARCH ──
async function doSearch() {
  if (!prods.length) return;
  show("loader");
  hide("resSec");
  hide("empty");
  hide("mlBox");
  hide("cmpSec");
  try {
    const r = await fetch(API + "/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: prods,
        lat: uLat,
        lng: uLng,
        max_km: 25,
      }),
    });
    const d = await r.json();
    hide("loader");
    shopRes = d.results;
    showML(d.classifications);
    if (d.results.length > 0) {
      renderShops(d);
      updateMarkers(d.results);
    } else {
      show("empty");
      document.getElementById("emptyMsg").textContent =
        `No shops for: ${prods.join(", ")}`;
    }
  } catch (e) {
    hide("loader");
    toast("Start ML: python main.py", "err");
  }
}

// ── ML BOX ──
function showML(cls) {
  if (!cls?.length) return;
  let h = "<h4>🧠 AI Classification</h4><div>";
  cls.forEach((c) => {
    const cl = c.confidence > 0.7 ? "mt-g" : "mt-y";
    h += `<span class="mt ${cl}">${cIcon(c.category)} ${c.query} → ${c.category} (${(c.confidence * 100).toFixed(0)}%)</span>`;
  });
  h += "</div>";
  document.getElementById("mlBox").innerHTML = h;
  show("mlBox");
}

// ── SHOP CARDS ──
function renderShops(data) {
  document.getElementById("resTitle").textContent = `${data.total} shops found`;
  const el = document.getElementById("shopCards");
  el.innerHTML = data.results
    .map((s, i) => {
      const sc = s.score,
        col = sc >= 0.7 ? "#22c55e" : sc >= 0.4 ? "#eab308" : "#ef4444",
        rc = i < 3 ? "rk" + (i + 1) : "rkx",
        bc = bgCl(s.badge);
      const dir = s.products.filter((p) => p.match === "direct").slice(0, 5);
      const cat = s.products.filter((p) => p.match === "category").slice(0, 3);
      return `<div class="sc ${i === 0 ? "best" : ""}" id="s-${s.id}">
<div class="sh"><div class="sl"><div class="rk ${rc}">#${s.rank}</div><div><div class="sn">${s.icon} ${s.name}</div><div class="sa">📍 ${s.addr} · ${s.type}</div></div></div>${s.badge ? `<span class="bg ${bc}">${s.badge}</span>` : ""}</div>
<div class="sm"><span><i class="fa-solid fa-location-dot"></i> ${fD(s.dist)}</span><span><i class="fa-solid fa-star"></i> ${s.rating} (${s.reviews})</span><span><i class="fa-solid fa-tag"></i> Avg ₹${s.avg_price}</span><span><i class="fa-solid fa-gem"></i> Quality ${s.avg_quality}/5</span><span><i class="fa-solid fa-box"></i> ${s.total} items</span><span><i class="fa-solid fa-truck"></i> ₹${s.fee}</span></div>
<div class="sb"><div class="sbh"><span>AI Score</span><span class="sbv" style="color:${col}">${(sc * 100).toFixed(0)}%</span></div><div class="sbb"><div class="sbf" style="width:${sc * 100}%;background:${col}"></div></div>
<div class="sbc"><span class="sbci">📍${(s.breakdown.distance * 100) | 0}%</span><span class="sbci">⭐${(s.breakdown.rating * 100) | 0}%</span><span class="sbci">💰${(s.breakdown.price * 100) | 0}%</span><span class="sbci">💎${(s.breakdown.quality * 100) | 0}%</span><span class="sbci">🎯${(s.breakdown.relevance * 100) | 0}%</span></div></div>
<div class="pp">${dir.map((p) => `<span class="pt di" onclick="addCart('${esc(p.n)}',${p.p},'${s.id}','${esc(s.name)}')">✅${p.n} <span class="pr">₹${p.p}</span> <i class="fa-solid fa-cart-plus"></i></span>`).join("")}${cat.map((p) => `<span class="pt" onclick="addCart('${esc(p.n)}',${p.p},'${s.id}','${esc(s.name)}')">${p.n} ₹${p.p} <i class="fa-solid fa-cart-plus"></i></span>`).join("")}${s.total > 8 ? `<span class="pt">+${s.total - 8} more</span>` : ""}</div>
<div class="sa2"><button class="ab ab-p" onclick="focusShop(${s.lat},${s.lng},'${esc(s.name)}')"><i class="fa-solid fa-map-pin"></i> Map</button><button class="ab ab-g" onclick="showRoute(${s.lat},${s.lng})"><i class="fa-solid fa-route"></i> Route</button>${dir.length ? `<button class="ab ab-c" onclick="doCompare('${esc(dir[0].n)}')"><i class="fa-solid fa-scale-balanced"></i> Compare "${dir[0].n.substring(0, 15)}"</button>` : ""}<a href="tel:${s.phone}" class="ab ab-o"><i class="fa-solid fa-phone"></i></a></div></div>`;
    })
    .join("");
  show("resSec");
}

// ── COMPARE ──
async function doCompare(product) {
  try {
    const r = await fetch(API + "/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, lat: uLat, lng: uLng }),
    });
    const d = await r.json();
    if (!d.comparisons.length) {
      toast("No comparison data", "err");
      return;
    }
    document.getElementById("cmpProd").textContent = `"${product}"`;
    let h = `<table class="ctable"><thead><tr><th>Shop</th><th>Product</th><th>Price</th><th>Brand</th><th>Quality</th><th>Dist</th><th>Discount</th><th></th></tr></thead><tbody>`;
    d.comparisons.forEach((c) => {
      const badges = [];
      if (c.is_cheapest)
        badges.push('<span class="cmp-badge cmp-cheap">Cheapest</span>');
      if (c.is_best_quality)
        badges.push('<span class="cmp-badge cmp-qual">Best Quality</span>');
      if (c.is_nearest)
        badges.push('<span class="cmp-badge cmp-near">Nearest</span>');
      if (c.is_best_value)
        badges.push('<span class="cmp-badge cmp-val">Best Value</span>');
      h += `<tr>
<td>${c.shop_icon} ${c.shop_name}<br><span style="font-size:9px;color:var(--tx3)">⭐${c.shop_rating}</span></td>
<td>${c.product_name}${c.match === "direct" ? " ✅" : ""}</td>
<td class="${c.is_cheapest ? "best-cell" : ""}">₹${c.price} <span style="text-decoration:line-through;color:var(--tx3);font-size:9px">₹${c.mrp}</span></td>
<td>${c.brand}</td>
<td class="${c.is_best_quality ? "best-cell" : ""}"><span style="color:var(--yl)">${"★".repeat(c.quality)}${"☆".repeat(5 - c.quality)}</span></td>
<td class="${c.is_nearest ? "best-cell" : ""}">${fD(c.shop_dist)}</td>
<td>${c.discount}%</td>
<td><button class="cmp-cart" onclick="addCart('${esc(c.product_name)}',${c.price},'${c.shop_id}','${esc(c.shop_name)}')"><i class="fa-solid fa-cart-plus"></i></button></td>
</tr>`;
      if (badges.length)
        h += `<tr><td colspan="8" style="padding:2px 8px;border:none">${badges.join(" ")}</td></tr>`;
    });
    h += "</tbody></table>";
    document.getElementById("cmpBody").innerHTML = h;
    show("cmpSec");
    document.getElementById("cmpSec").scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    toast("Compare failed", "err");
  }
}
function closeCmp() {
  hide("cmpSec");
}

// ── MAP ──
function initMap() {
  if (typeof google === "undefined") return;

  mOk = true;

  const el = document.getElementById("gmap");

  map = new google.maps.Map(el, {
    center: { lat: uLat, lng: uLng },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  placeUser();
  // show all shops initially
  fetch(API + "/shops")
    .then((r) => r.json())
    .then((d) => {
      if (!d.shops) return;
      d.shops.forEach((s) => {
        const mk = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#6366f1",
            fillOpacity: 0.4,
            strokeColor: "#fff",
            strokeWeight: 1,
          },
          title: s.name,
        });
        const iw = new google.maps.InfoWindow({
          content: `<div style="font-family:Inter;padding:2px"><b>${s.icon} ${s.name}</b><br><span style="font-size:11px;color:#888">${s.type} · ⭐${s.rating}</span></div>`,
        });
        mk.addListener("click", () => iw.open(map, mk));
        markers.push(mk);
      });
    })
    .catch(() => {});
}
function placeUser() {
  if (!map) return;
  if (userMk) userMk.setMap(null);
  userMk = new google.maps.Marker({
    position: { lat: uLat, lng: uLng },
    map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 11,
      fillColor: "#6366f1",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 3,
    },
    title: "You",
    zIndex: 999,
  });
}
function updateMarkers(shops) {
  if (!map) return;
  markers.forEach((m) => m.setMap(null));
  markers = [];
  if (dirR) {
    dirR.setMap(null);
    dirR = null;
  }
  const bounds = new google.maps.LatLngBounds();
  bounds.extend({ lat: uLat, lng: uLng });
  const colors = [
    "#22c55e",
    "#eab308",
    "#f97316",
    "#ef4444",
    "#6366f1",
    "#3b82f6",
    "#a855f7",
    "#ec4899",
  ];
  shops.forEach((s, i) => {
    const pos = { lat: s.lat, lng: s.lng },
      c = colors[i % colors.length];
    const mk = new google.maps.Marker({
      position: pos,
      map,
      label: {
        text: `${i + 1}`,
        color: "#fff",
        fontWeight: "bold",
        fontSize: "11px",
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: c,
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
      title: s.name,
      zIndex: 90 - i,
    });
    const iw = new google.maps.InfoWindow({
      content: `<div style="font-family:Inter;padding:3px;min-width:160px"><b>${s.icon} ${s.name}</b><br><span style="font-size:11px;color:#666">📍${fD(s.dist)} · ⭐${s.rating} · Score:${(s.score * 100) | 0}%</span><br><button onclick="showRoute(${s.lat},${s.lng})" style="margin-top:5px;padding:4px 10px;background:#6366f1;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:10px">Route</button></div>`,
    });
    mk.addListener("click", () => {
      iw.open(map, mk);
      document.getElementById("minfo").textContent =
        `${s.icon} ${s.name} — ${fD(s.dist)}`;
      const card = document.getElementById("s-" + s.id);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    markers.push(mk);
    bounds.extend(pos);
  });
  map.fitBounds(bounds, { padding: 50 });
}
function focusShop(lat, lng, name) {
  if (!map) {
    toast("Map not loaded", "err");
    return;
  }
  map.panTo({ lat, lng });
  map.setZoom(15);
  document.getElementById("minfo").textContent = name;
  document.querySelector(".right").scrollIntoView({ behavior: "smooth" });
}
function showRoute(lat, lng) {
  if (!map || !mOk) {
    toast("Map not loaded", "err");
    return;
  }
  if (dirR) dirR.setMap(null);
  dirR = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#6366f1",
      strokeWeight: 5,
      strokeOpacity: 0.8,
    },
  });
  new google.maps.DirectionsService().route(
    {
      origin: { lat: uLat, lng: uLng },
      destination: { lat, lng },
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (res, st) => {
      if (st === "OK") {
        dirR.setDirections(res);
        const l = res.routes[0].legs[0];
        document.getElementById("minfo").textContent =
          `🗺️ ${l.distance.text} — ${l.duration.text}`;
        toast(`${l.distance.text}, ${l.duration.text}`, "inf");
        document.querySelector(".right").scrollIntoView({ behavior: "smooth" });
      } else toast("Route unavailable", "err");
    },
  );
}

// ── CART ──
function addCart(n, p, sid, sn) {
  const x = cart.find((c) => c.n === n && c.sid === sid);
  if (x) {
    x.q++;
    saveC();
    renderCart();
    toast(`${n} qty +1`, "ok");
    return;
  }
  cart.push({ n, p, q: 1, sid, sn });
  saveC();
  renderCart();
  toast(`${n} added`, "ok");
}
function chgQ(i, d) {
  cart[i].q += d;
  if (cart[i].q <= 0) cart.splice(i, 1);
  saveC();
  renderCart();
}
function rmC(i) {
  cart.splice(i, 1);
  saveC();
  renderCart();
}
function renderCart() {
  const el = document.getElementById("citems"),
    ft = document.getElementById("cfoot");
  document.getElementById("cartBadge").textContent = cart.reduce(
    (s, c) => s + c.q,
    0,
  );
  if (!cart.length) {
    el.innerHTML =
      '<div class="cempty"><i class="fa-solid fa-cart-shopping" style="font-size:24px;display:block;margin-bottom:6px"></i>Cart empty<br><small style="color:var(--tx3)">Click products to add</small></div>';
    ft.style.display = "none";
    return;
  }
  // Group by shop
  const shops = {};
  cart.forEach((c, i) => {
    if (!shops[c.sn]) shops[c.sn] = [];
    shops[c.sn].push({ ...c, idx: i });
  });
  let h = "";
  for (const [sn, items] of Object.entries(shops)) {
    h += `<div style="font-size:10px;color:var(--tx3);margin:6px 0 3px;font-weight:600">🏪 ${sn}</div>`;
    items.forEach((c) => {
      h += `<div class="ci"><div class="ci-i"><div class="ci-n">${c.n}</div></div><div class="ci-q"><button onclick="chgQ(${c.idx},-1)">−</button><span>${c.q}</span><button onclick="chgQ(${c.idx},1)">+</button></div><div class="ci-p">₹${c.p * c.q}</div><button class="ci-d" onclick="rmC(${c.idx})"><i class="fa-solid fa-trash"></i></button></div>`;
    });
  }
  el.innerHTML = h;
  document.getElementById("ctotal").textContent =
    `₹${cart.reduce((s, c) => s + c.p * c.q, 0)}`;
  ft.style.display = "block";
}
function toggleCart() {
  document.getElementById("cartPanel").classList.toggle("open");
}
function saveC() {
  localStorage.setItem("sc", JSON.stringify(cart));
}
function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem("sc")) || [];
  } catch {
    cart = [];
  }
}

// ── ORDER ──
async function placeOrder() {
  if (!cart.length) {
    toast("Cart empty", "err");
    return;
  }
  const addr = document.getElementById("oAddr").value.trim();
  if (!addr) {
    toast("Enter address", "err");
    return;
  }
  try {
    const r = await fetch(API + "/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((c) => ({
          name: c.n,
          price: c.p,
          qty: c.q,
          shop_id: c.sid,
          shop_name: c.sn,
        })),
        name: document.getElementById("oName").value || "Guest",
        phone: document.getElementById("oPhone").value,
        address: addr,
        lat: uLat,
        lng: uLng,
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.detail);
    cart = [];
    saveC();
    renderCart();
    toggleCart();
    const o = d.order;
    document.getElementById("orderBody").innerHTML =
      `<div style="font-size:44px;margin-bottom:10px">✅</div><h2 style="color:#22c55e;margin-bottom:6px">Order Placed!</h2><p style="color:var(--tx3);font-size:13px;margin-bottom:14px">ID: <b>${o.id}</b> · ${o.time}</p>
<div style="background:var(--bg3);border-radius:9px;padding:12px;text-align:left;font-size:12px;color:var(--tx2);margin-bottom:10px">${o.items.map((it) => `<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span>${it.name} ×${it.qty} <span style="color:var(--tx3);font-size:10px">(${it.shop_name})</span></span><span style="color:#22c55e;font-weight:700">₹${it.price * it.qty}</span></div>`).join("")}<div style="border-top:1px solid var(--brd);margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-size:14px"><span>Total</span><b style="color:#22c55e">₹${o.total}</b></div></div>
<p style="font-size:11px;color:var(--tx3)">📍 ${o.address}</p>`;
    document.getElementById("orderModal").classList.add("on");
    toast("Order confirmed! 🎉", "ok");
  } catch (e) {
    toast(e.message || "Failed", "err");
  }
}

// ── HELPERS ──
function show(i) {
  document.getElementById(i).style.display = "block";
}
function hide(i) {
  document.getElementById(i).style.display = "none";
}
function fD(k) {
  return k < 1 ? `${(k * 1000) | 0}m` : `${k.toFixed(1)}km`;
}
function esc(s) {
  return s.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function cIcon(c) {
  return (
    {
      grocery: "🛒",
      dairy: "🥛",
      electrical: "💡",
      medical: "💊",
      hardware: "🔨",
      bakery: "🍞",
      electronics: "📱",
      clothing: "👕",
      stationery: "📝",
      vegetables: "🥕",
    }[c] || "📦"
  );
}
function bgCl(b) {
  if (!b) return "";
  if (b.includes("Best Overall")) return "bg-g";
  if (b.includes("Near")) return "bg-b";
  if (b.includes("Price")) return "bg-y";
  if (b.includes("Rated")) return "bg-o";
  if (b.includes("Quality")) return "bg-d";
  return "bg-g";
}
function toast(m, t = "inf") {
  const e = document.getElementById("toast");
  e.textContent = m;
  e.className = `toast ${t} show`;
  setTimeout(() => (e.className = "toast"), 3000);
}
