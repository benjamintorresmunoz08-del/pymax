/**
 * ═══════════════════════════════════════════════════════════════════
 *  PYMAX MULTI-CURRENCY SYSTEM
 * ═══════════════════════════════════════════════════════════════════
 *  Los montos se almacenan en PESOS CHILENOS (CLP) como moneda base.
 *  Este módulo convierte y formatea cualquier valor a la moneda que
 *  el usuario elija en tiempo real.
 *
 *  - Soporte: CLP, USD, EUR, GBP, BRL, MXN, ARS, COP, PEN, UYU
 *  - Persistencia en localStorage
 *  - Formateo con Intl.NumberFormat (símbolo y separadores locales)
 *  - Evento global "pymax:currency" al cambiar
 *
 *  NOTA: las tasas son valores de referencia aproximados. En producción
 *  pueden reemplazarse por una API (exchangerate-api.com, fixer.io, etc.).
 * ═══════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    var BASE_CURRENCY = 'CLP';

    // 1 CLP = rate unidades de la moneda destino
    var CURRENCIES = {
        CLP: { symbol: '$',   name: 'Peso Chileno',         flag: '🇨🇱', locale: 'es-CL', rate: 1 },
        USD: { symbol: 'US$', name: 'Dólar Estadounidense', flag: '🇺🇸', locale: 'en-US', rate: 0.00105 },
        EUR: { symbol: '€',   name: 'Euro',                 flag: '🇪🇺', locale: 'es-ES', rate: 0.00097 },
        GBP: { symbol: '£',   name: 'Libra Esterlina',      flag: '🇬🇧', locale: 'en-GB', rate: 0.00083 },
        BRL: { symbol: 'R$',  name: 'Real Brasileño',       flag: '🇧🇷', locale: 'pt-BR', rate: 0.0056 },
        MXN: { symbol: 'MX$', name: 'Peso Mexicano',        flag: '🇲🇽', locale: 'es-MX', rate: 0.0185 },
        ARS: { symbol: 'AR$', name: 'Peso Argentino',       flag: '🇦🇷', locale: 'es-AR', rate: 1.09 },
        COP: { symbol: 'COL$',name: 'Peso Colombiano',      flag: '🇨🇴', locale: 'es-CO', rate: 4.42 },
        PEN: { symbol: 'S/',  name: 'Sol Peruano',          flag: '🇵🇪', locale: 'es-PE', rate: 0.00395 },
        UYU: { symbol: '$U',  name: 'Peso Uruguayo',        flag: '🇺🇾', locale: 'es-UY', rate: 0.043 }
    };

    var STORAGE_KEY = 'pymax_currency';

    function PymaxCurrency() {
        this.base = BASE_CURRENCY;
        this.current = this._load();
    }

    PymaxCurrency.prototype._load = function () {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved && CURRENCIES[saved]) return saved;
        } catch (e) { /* storage no disponible */ }
        return BASE_CURRENCY;
    };

    PymaxCurrency.prototype._save = function () {
        try {
            localStorage.setItem(STORAGE_KEY, this.current);
        } catch (e) { /* storage no disponible */ }
    };

    PymaxCurrency.prototype.getInfo = function (code) {
        var c = code || this.current;
        if (!CURRENCIES[c]) c = BASE_CURRENCY;
        var info = CURRENCIES[c];
        return {
            code: c,
            symbol: info.symbol,
            name: info.name,
            flag: info.flag,
            locale: info.locale,
            rate: info.rate
        };
    };

    PymaxCurrency.prototype.getList = function () {
        return Object.keys(CURRENCIES).map(function (code) {
            var i = CURRENCIES[code];
            return { code: code, symbol: i.symbol, name: i.name, flag: i.flag, locale: i.locale, rate: i.rate };
        });
    };

    PymaxCurrency.prototype.setCurrency = function (code) {
        if (!CURRENCIES[code]) return false;
        var old = this.current;
        this.current = code;
        this._save();
        window.dispatchEvent(new CustomEvent('pymax:currency', {
            detail: { oldCurrency: old, newCurrency: code }
        }));
        return true;
    };

    // Convierte un monto en CLP (base) a la moneda actual
    PymaxCurrency.prototype.convert = function (amountInCLP) {
        var n = parseFloat(amountInCLP) || 0;
        return n * this.getInfo().rate;
    };

    // Formatea un monto en CLP (base) a la moneda actual
    PymaxCurrency.prototype.format = function (amountInCLP) {
        var info = this.getInfo();
        var converted = this.convert(amountInCLP);
        try {
            return new Intl.NumberFormat(info.locale, {
                style: 'currency',
                currency: info.code
            }).format(converted);
        } catch (e) {
            return info.symbol + ' ' + converted.toLocaleString(info.locale);
        }
    };

    // Símbolo corto de la moneda actual
    PymaxCurrency.prototype.symbol = function () {
        return this.getInfo().symbol;
    };

    // Código de la moneda actual (ej: CLP, USD)
    PymaxCurrency.prototype.code = function () {
        return this.current;
    };

    window.pymaxCurrency = new PymaxCurrency();

    // Helper global para usar en cualquier template
    window.fmtMoney = function (amountInCLP) {
        return window.pymaxCurrency.format(amountInCLP);
    };

    window.dispatchEvent(new CustomEvent('pymax:currency', {
        detail: { oldCurrency: BASE_CURRENCY, newCurrency: window.pymaxCurrency.current }
    }));

    console.log('💱 Pymax Multi-Currency System ready (' + window.pymaxCurrency.current + ')');
})();
