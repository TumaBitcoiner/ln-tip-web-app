import axios from 'axios';

export interface InvoiceResult {
  invoice: string[];
  error?: string;
}

export async function generateInvoice( 
  lnAddress: string, 
  amount: number, 
  message: string, 
): Promise<InvoiceResult> {

    // Input validation
    if (!lnAddress || amount <= 0 ) {
        return { 
        invoice: [],
        error: "Invalid input: LN address, positive amount, and positive num_people required." 
        };
    }

    const addressParts = lnAddress.split('@');
    if (addressParts.length !== 2) {
        return { 
        invoice: [],
        error: "Invalid LN address format. Use: user@domain.com." 
        };
    }

    const [username, domain] = addressParts;
    const wellKnownUrl = `https://${domain}/.well-known/lnurlp/${username}`;
  
    const amountMSats = amount * 1000;

    try {
        // Step 1: Fetch LNURL metadata
        const metadataResponse = await axios.get(wellKnownUrl, { timeout: 10000 });
        const lnurlData = metadataResponse.data;
        
        // Verify it's a pay request
        if (lnurlData.tag !== 'payRequest') {
            return { 
                invoice: [],
                error: "The provided address does not support LNURL-pay." 
            };
        }
        
        // Check amount limits
        if (amountMSats < lnurlData.minSendable || amountMSats > lnurlData.maxSendable) {
            const min = lnurlData.minSendable / 1000;
            const max = lnurlData.maxSendable / 1000;
            return { 
                invoice: [], 
                error: `Share amount ${amountMSats} sats is outside the allowed range (min ${min} sats, max ${max} sats).` 
            };
        }

        // Step 2: Generate invoice
        const callbackUrl = lnurlData.callback;
        let generatedInvoice: string;

        try {
            let payLink = `${callbackUrl}?amount=${amountMSats}`;
            
            // Add comment if the server supports it and message is provided
            if (message && lnurlData.commentAllowed && lnurlData.commentAllowed > 0) {
                const truncatedMessage = message.substring(0, lnurlData.commentAllowed);
                payLink += `&comment=${encodeURIComponent(truncatedMessage)}`;
            }
            
            const invoiceResponse = await axios.get(payLink, { timeout: 10000 });
            
            if (invoiceResponse.status !== 200) {
                return { 
                    invoice: [], 
                    error: `API responded with status ${invoiceResponse.status}` 
                };
            }
            
            generatedInvoice = invoiceResponse.data.pr; // 'pr' contains the BOLT11 invoice
            if (!generatedInvoice) {
                return { 
                    invoice: [], 
                    error: "No invoice found in response" 
                };
            }
            
        } catch (error: any) {
            return { 
                invoice: [], 
                error: `Failed to generate invoice - ${error.message}` 
            };
        }
        
        return { invoice: [generatedInvoice] };

    } catch (error: any) {
        return { 
        invoice: [], 
        error: `Failed to resolve Lightning Address: ${error.message}` 
        };
    }
}
