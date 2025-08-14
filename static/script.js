document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Vistas (Navegación) ---
    const navLinks = document.querySelectorAll('.nav-links a');
    const mainViews = document.querySelectorAll('.main-view');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const viewId = this.dataset.view + '-view';

            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');

            mainViews.forEach(view => {
                if (view.id === viewId) {
                    view.classList.remove('hidden');
                    // Llama a la función específica para la vista
                    if (viewId === 'juegos-view') {
                        renderJuegos();
                    } else if (viewId === 'carrito-view') {
                        renderCart();
                    }
                } else {
                    view.classList.add('hidden');
                }
            });
        });
    });

    // --- Lógica del Carrito de Compras ---
    let cart = [];
    let purchaseHistory = []; // Nuevo arreglo para el historial de compras
    const cartTableBody = document.getElementById('cart-table-body');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.querySelector('.btn-checkout');

    // Botones "Añadir al Carrito" en la vista de inicio
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', e => {
            const row = e.target.closest('tr');
            const title = row.children[0].textContent;
            const price = parseFloat(row.querySelector('.price').textContent.replace('$', ''));
            
            addToCart({ title, price });
        });
    });
    
    function addToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.title === item.title);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        renderCart();
    }

    function updateQuantity(title, newQuantity) {
        const item = cart.find(cartItem => cartItem.title === title);
        if (item) {
            item.quantity = newQuantity;
            if (item.quantity <= 0) {
                removeFromCart(title);
            } else {
                renderCart();
            }
        }
    }

    function removeFromCart(title) {
        cart = cart.filter(item => item.title !== title);
        renderCart();
    }

    function renderCart() {
        cartTableBody.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.title}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <div class="quantity-controls">
                           <button class="quantity-btn" data-title="${item.title}" data-change="-1">-</button>
                           <span>${item.quantity}</span>
                           <button class="quantity-btn" data-title="${item.title}" data-change="1">+</button>
                        </div>
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td><button class="btn-remove-item" data-title="${item.title}"><i class="fas fa-trash"></i></button></td>
                `;
                cartTableBody.appendChild(row);
            });
        }
        updateCartSummary();
        addCartEventListeners();
    }
    
    function updateCartSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTax.textContent = `$${tax.toFixed(2)}`;
        cartTotal.textContent = `$${total.toFixed(2)}`;

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    function addCartEventListeners() {
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', e => {
                const title = e.currentTarget.dataset.title;
                const change = parseInt(e.currentTarget.dataset.change);
                const item = cart.find(i => i.title === title);
                if (item) {
                    updateQuantity(title, item.quantity + change);
                }
            });
        });

        document.querySelectorAll('.btn-remove-item').forEach(button => {
            button.addEventListener('click', e => {
                const title = e.currentTarget.dataset.title;
                removeFromCart(title);
            });
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if(cart.length > 0) {
                alert('pago exitoso');
                // Almacena los ítems del carrito en el historial de compras
                const purchaseDate = new Date().toISOString().slice(0, 10);
                cart.forEach(item => {
                    purchaseHistory.unshift({ // Añade al principio del historial
                        title: item.title,
                        date: purchaseDate,
                        platform: "PC",
                        price: item.price
                    });
                });

                // Vacia el carrito después de un pago exitoso
                cart = [];
                renderCart();
                updateCartSummary();
            } else {
                alert('Tu carrito está vacío.');
            }
        });
    }

    // --- Lógica de Historial de Juegos Comprados ---
    function renderJuegos() {
        const purchaseHistoryBody = document.getElementById('purchase-history-body');
        const emptyHistoryMessage = document.getElementById('empty-history-message');
        
        purchaseHistoryBody.innerHTML = '';

        if (purchaseHistory.length === 0) {
            emptyHistoryMessage.classList.remove('hidden');
        } else {
            emptyHistoryMessage.classList.add('hidden');
            purchaseHistory.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.title}</td>
                    <td>${item.date}</td>
                    <td>${item.platform}</td>
                    <td class="price">$${item.price.toFixed(2)}</td>
                `;
                purchaseHistoryBody.appendChild(row);
            });
        }
    }

    // --- Lógica de Scripts de Python ---
    const scriptsView = document.getElementById('scripts-view');
    if (scriptsView) {
        const viewCodeBtns = scriptsView.querySelectorAll('.btn-view-code');
        const runScriptBtns = scriptsView.querySelectorAll('.btn-run-script');
        const consolePre = document.getElementById('console-pre');

        viewCodeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const codeContainer = btn.closest('.script-item').querySelector('.code-container');
                codeContainer.classList.toggle('hidden');
                if (!codeContainer.classList.contains('hidden')) {
                    btn.textContent = 'Ocultar Código';
                } else {
                    btn.textContent = 'Ver Código';
                }
            });
        });

        runScriptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const scriptName = btn.dataset.scriptName;
                runScript(scriptName);
            });
        });

        function runScript(scriptName) {
            consolePre.textContent = `> Executing script: ${scriptName}.py...\n`;
            
            let output = '';
            if (scriptName === 'sales_report') {
                output = [
                    "Iniciando la generación del reporte de ventas...",
                    "Obteniendo datos del último mes...",
                    "Escribiendo datos en el archivo CSV...",
                    "Reporte 'sales_report_2023_11_20.csv' generado exitosamente."
                ];
            } else if (scriptName === 'clear_cache') {
                output = [
                    "Conectando al servidor de Redis...",
                    "Conexión exitosa (simulado).",
                    "Limpiando todas las claves de la caché...",
                    "1845 claves eliminadas.",
                    "Caché de la base de datos limpiada correctamente."
                ];
            } else {
                 output = ["Error: Script no encontrado."];
            }

            let i = 0;
            const intervalId = setInterval(() => {
                if (i < output.length) {
                    consolePre.textContent += `${output[i]}\n`;
                    i++;
                } else {
                    consolePre.textContent += `> Execution finished.\n`;
                    clearInterval(intervalId);
                }
                consolePre.scrollTop = consolePre.scrollHeight;
            }, 700);
        }
    }

    // Inicializa el estado del carrito
    updateCartSummary();

    // Eventos de botones de usuario
    document.getElementById('logout-btn').addEventListener('click', () => {
        alert('Cerrando sesión...');
    });
    document.getElementById('account-btn').addEventListener('click', () => {
        alert('Mostrando datos de la cuenta...');
    });
});