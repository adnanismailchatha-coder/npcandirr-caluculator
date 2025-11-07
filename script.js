
        // Helper function to get inputs (unchanged)
        function getInputs() {
            const rate = parseFloat(document.getElementById('discountRate').value);
            const cfs = [
                parseFloat(document.getElementById('cf0').value),
                parseFloat(document.getElementById('cf1').value),
                parseFloat(document.getElementById('cf2').value),
                parseFloat(document.getElementById('cf3').value),
                parseFloat(document.getElementById('cf4').value)
            ];
            if (isNaN(rate) || cfs.some(isNaN)) {
                document.getElementById('result').textContent = "Error: Please enter valid numbers for all fields.";
                return null;
            }
            return { discountRate: rate, cashFlows: cfs };
        }

        // --- NPV Calculation with Enhanced Explanation ---
        function calculateNPV() {
            const inputs = getInputs();
            if (!inputs) return;

            const { discountRate, cashFlows } = inputs;
            const ratePercent = (discountRate * 100).toFixed(2);
            let npv = cashFlows[0]; 
            let explanation = `## Net Present Value (NPV) Calculation\n\n`;
            
            // Formula display area - replace with image tag if possible in final environment
            explanation += "**Formula:**\n";
            explanation += `NPV = Sum of [ $\\frac{CF_t}{(1+r)^t}$ ] for t=1 to n, PLUS $CF_0$\n`;
            explanation += `\n\n`;
            
            explanation += `**Inputs:**\n* Required Rate (r): ${ratePercent}%\n* Cash Flows (CF): [${cashFlows.join(', ')}]\n\n`;
            explanation += "**Step-by-Step Discounting:**\n";
            explanation += "------------------------------------------------------------------\n";
            explanation += `Time | Cash Flow (CF) | Calculation | Present Value (PV)\n`;
            explanation += "------------------------------------------------------------------\n";

            // CF0
            const pv0 = cashFlows[0];
            explanation += `0    | ${cashFlows[0].toFixed(2)}  | ${cashFlows[0].toFixed(2)} / (1 + ${discountRate})^{0} | ${pv0.toFixed(2)}\n`;
            
            // Future Cash Flows
            for (let t = 1; t < cashFlows.length; t++) {
                const pv = cashFlows[t] / Math.pow(1 + discountRate, t);
                npv += pv;
                explanation += `${t}    | ${cashFlows[t].toFixed(2)}    | ${cashFlows[t].toFixed(2)} / (1 + ${discountRate})^{${t}} | ${pv.toFixed(2)}\n`;
            }
            explanation += "------------------------------------------------------------------\n";
            
            explanation += `\n**Final Result:**\n`;
            explanation += `NPV = (Sum of all PVs)\n`;
            explanation += `NPV = **$${npv.toFixed(2)}**\n\n`;
            
            if (npv > 0) {
                explanation += "✅ **Decision:** Since NPV is positive, the project is financially acceptable as it adds value to the firm.";
            } else if (npv < 0) {
                explanation += "❌ **Decision:** Since NPV is negative, the project is financially unacceptable as it destroys value.";
            } else {
                explanation += "⚠️ **Decision:** Since NPV is zero, the project returns exactly the required rate. Indifferent decision.";
            }

            document.getElementById('result').textContent = explanation;
        }

        // Helper function for IRR (unchanged)
        function npvForIRR(rate, cfs) {
            if (rate <= -1) return Infinity; 
            let npv = cfs[0];
            for (let t = 1; t < cfs.length; t++) {
                npv += cfs[t] / Math.pow(1 + rate, t);
            }
            return npv;
        }

        // --- IRR Calculation with Enhanced Explanation ---
        function calculateIRR() {
            const inputs = getInputs();
            if (!inputs) return;

            const { cashFlows } = inputs;
            const hasNegative = cashFlows.some(cf => cf < 0);
            const hasPositive = cashFlows.some(cf => cf > 0);
            
            let explanation = `## Internal Rate of Return (IRR) Calculation\n\n`;

            if (!hasNegative || !hasPositive) {
                explanation += "IRR requires at least one cash outflow (negative) and one inflow (positive). Calculation aborted.";
                document.getElementById('result').textContent = explanation;
                return;
            }

            // Formula display area - replace with image tag if possible in final environment
            explanation += "**Formula:**\n";
            explanation += `The IRR is the rate (r) that makes the NPV equal to zero:\n`;
            explanation += `$\\sum_{t=0}^{n} \\frac{CF_t}{(1+IRR)^t} = 0$\n`;
            explanation += `\n\n`;

            explanation += `**Method:** Found through iterative approximation (Secant Method) because there is no direct algebraic solution.\n`;
            explanation += `**Required Rate (r):** ${(parseFloat(document.getElementById('discountRate').value) * 100).toFixed(2)}%\n`;
            explanation += `**Cash Flows:** [${cashFlows.join(', ')}]\n\n`;

            // Iteration setup (unchanged)
            let rateA = 0.10; 
            let rateB = 0.20; 
            const precision = 0.000001;
            const maxIterations = 100;
            let finalIRR = null;

            for (let i = 0; i < maxIterations; i++) {
                let npvA = npvForIRR(rateA, cashFlows);
                let npvB = npvForIRR(rateB, cashFlows);
                
                if (Math.abs(npvB) < precision) {
                    finalIRR = rateB;
                    break;
                }
                
                if (Math.abs(npvB - npvA) < 1e-10) {
                    explanation += "Calculation failed due to numerical instability (division by zero).";
                    document.getElementById('result').textContent = explanation;
                    return;
                }

                let rateC = rateB - npvB * ((rateB - rateA) / (npvB - npvA));

                rateA = rateB;
                rateB = rateC;
                
                if (rateB > 10 || rateB < -0.99) { 
                    explanation += "IRR calculation failed. Rate is outside reasonable bounds (must be > -99%).";
                    document.getElementById('result').textContent = explanation;
                    return;
                }

                if (i === maxIterations - 1) {
                    explanation += "Calculation failed to converge after 100 iterations.";
                    document.getElementById('result').textContent = explanation;
                    return;
                }
            }
            
            if (finalIRR !== null) {
                const requiredRate = parseFloat(document.getElementById('discountRate').value);
                const irrPercent = (finalIRR * 100).toFixed(2);
                const requiredRatePercent = (requiredRate * 100).toFixed(2);

                explanation += `**Result:**\n`;
                explanation += `After iteration, the **Internal Rate of Return (IRR)** is approximately **${irrPercent}%**.\n\n`;
                explanation += `**Check:** At IRR = ${irrPercent}%, the NPV is essentially $${npvForIRR(finalIRR, cashFlows).toFixed(2)}. (NPV $\\approx$ 0)\n\n`;
                
                explanation += `**Decision:**\n`;
                if (finalIRR > requiredRate) {
                    explanation += `✅ **Decision:** Since IRR (${irrPercent}%) > Required Rate (${requiredRatePercent}%), the project is financially acceptable.`;
                } else if (finalIRR < requiredRate) {
                    explanation += `❌ **Decision:** Since IRR (${irrPercent}%) < Required Rate (${requiredRatePercent}%), the project is financially unacceptable.`;
                } else {
                    explanation += `⚠️ **Decision:** Since IRR (${irrPercent}%) = Required Rate (${requiredRatePercent}%), the decision is indifferent.`;
                }
            }

            document.getElementById('result').textContent = explanation;
        }
    
    