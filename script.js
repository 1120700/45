document.addEventListener("DOMContentLoaded", () => {
    const inputAgua = document.getElementById("input-agua");
    const inputVinagre = document.getElementById("input-vinagre");
    const inputBicarbonato = document.getElementById("input-bicarbonato");
    const inputTemp = document.getElementById("input-temp");

    const valAgua = document.getElementById("val-agua");
    const valVinagre = document.getElementById("val-vinagre");
    const valBicarbonato = document.getElementById("val-bicarbonato");
    const valTemp = document.getElementById("val-temp");

    const liquid = document.getElementById("liquid");
    const bubbles = document.getElementById("bubbles");
    const phValue = document.getElementById("ph-value");
    const phStatus = document.getElementById("ph-status");

    function calcularSimulacion() {
        const agua = parseFloat(inputAgua.value);
        const vinagre = parseFloat(inputVinagre.value);
        const bicarbonato = parseFloat(inputBicarbonato.value);
        const temp = parseFloat(inputTemp.value);

        // Actualizar textos de los sliders
        valAgua.innerText = agua;
        valVinagre.innerText = vinagre;
        valBicarbonato.innerText = bicarbonato;
        valTemp.innerText = temp;

        const volTotalMl = agua + vinagre;
        const volTotalL = volTotalMl / 1000;

        // Moles de reactivos (Aproximación química)
        const molesAcido = (vinagre / 1000) * 0.8; // Vinagre ~5% ácido acético
        const molesBase = bicarbonato / 84.0;      // Masa molar NaHCO₃ = 84g/mol

        let molesAcidoRestante = 0;
        let molesBaseRestante = 0;
        let reaccionActiva = false;

        if (molesAcido > 0 && molesBase > 0) {
            reaccionActiva = true; // Si hay ambos, se produce CO₂ (burbujas)
            if (molesAcido > molesBase) {
                molesAcidoRestante = molesAcido - molesBase;
            } else {
                molesBaseRestante = molesBase - molesAcido;
            }
        } else {
            molesAcidoRestante = molesAcido;
            molesBaseRestante = molesBase;
        }

        // Cálculo de pH basado en el equilibrio químico
        let ph = 7.0; 
        const shiftTermico = (temp - 25) * 0.005; // Ajuste por temperatura en Kw

        if (vinagre === 0 && bicarbonato === 0) {
            ph = 7.0 - shiftTermico;
        } else if (molesAcidoRestante > 0) {
            const M_acido = molesAcidoRestante / volTotalL;
            const Ka = 1.8e-5 * (1 + (temp - 25) * 0.001); // Variación de Ka con Temp
            ph = -Math.log10(Math.sqrt(Ka * M_acido));
            if (isNaN(ph) || ph < 0) ph = 2.4;
        } else if (molesBaseRestante > 0) {
            const M_base = molesBaseRestante / volTotalL;
            const Kb = 2.3e-8; // Constante de hidrólisis simplificada
            let pOH = -Math.log10(Math.sqrt(Kb * M_base));
            if (isNaN(pOH)) pOH = 5.0;
            ph = (14.0 - shiftTermico) - pOH;
            if (ph > 9.5) ph = 9.5;
        } else {
            ph = 7.0 - shiftTermico; // Punto neutro exacto
        }

        // Límites lógicos del simulador
        ph = Math.max(1.0, Math.min(14.0, ph));
        phValue.innerText = ph.toFixed(2);

        // Actualizar colores del medidor y clasificaciones
        if (ph < 6.5) {
            phStatus.innerText = "Ácido";
            phValue.style.color = "#fc8181";
        } else if (ph > 7.5) {
            phStatus.innerText = "Alcalino (Base)";
            phValue.style.color = "#63b3ed";
        } else {
            phStatus.innerText = "Neutro";
            phValue.style.color = "#48bb78";
        }

        // Animación de llenado del Vaso de Precipitados
        const alturaPorcentaje = Math.min(92, (volTotalMl / 700) * 100 + (bicarbonato * 0.4));
        liquid.style.height = `${alturaPorcentaje}%`;

        // Color indicador del pH en el agua
        if (ph < 5.5) {
            liquid.style.backgroundColor = "rgba(229, 62, 62, 0.5)"; // Tono rojizo
        } else if (ph > 8.0) {
            liquid.style.backgroundColor = "rgba(49, 130, 206, 0.5)"; // Tono azulado
        } else {
            liquid.style.backgroundColor = "rgba(66, 153, 225, 0.5)"; // Tono neutro/agua
        }

        // Control de burbujas (Efervescencia)
        if (reaccionActiva && bicarbonato > 0.2 && vinagre > 1) {
            bubbles.style.opacity = "1";
            bubbles.style.height = `${alturaPorcentaje}%`;
            bubbles.classList.add("fizzing");
        } else {
            bubbles.style.opacity = "0";
            bubbles.style.height = "0%";
            bubbles.classList.remove("fizzing");
        }
    }

    inputAgua.addEventListener("input", calcularSimulacion);
    inputVinagre.addEventListener("input", calcularSimulacion);
    inputBicarbonato.addEventListener("input", calcularSimulacion);
    inputTemp.addEventListener("input", calcularSimulacion);

    calcularSimulacion(); // Ejecución inicial
});
