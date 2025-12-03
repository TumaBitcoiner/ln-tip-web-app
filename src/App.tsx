import { useState, useEffect } from 'react';
import { TipForm } from './components/TipForm';
import { QRDisplay } from './components/QRDisplay';
import { loadConfig } from './config';
import { Zap } from 'lucide-react';
import { generateInvoice } from './lnutils/GenerateInvoice';

function App() {
  const [invoice, setInvoice] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<{ amount: number; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig()
      .then(loadedConfig => setConfig(loadedConfig))
      .catch(err => setConfigError(err.message));
  }, []);

  const handleCreateInvoice = async (amount: number, message: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateInvoice(config.lightningAddress, amount, message);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.invoice && result.invoice.length > 0) {
        setInvoice(result.invoice[0]);
        setInvoiceData({ amount, message });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInvoice = () => {
    setInvoice(null);
    setInvoiceData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {configError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">Configuration Error</p>
              <p className="text-sm mt-1">{configError}</p>
            </div>
          ) : !config ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading configuration...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-orange-500 ring-offset-4 shadow-lg">
                    <img
                      src={config.profileImage}
                      alt={config.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-2 shadow-lg">
                    <Zap className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Send a tip to {config.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {config.lightningAddress}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                {!invoice ? (
                  <TipForm onCreateInvoice={handleCreateInvoice} loading={loading} error={error} />
                ) : (
                  invoiceData && (
                    <QRDisplay
                      invoice={invoice}
                      amount={invoiceData.amount}
                      message={invoiceData.message}
                      onClose={handleCloseInvoice}
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Powered by Lightning Network
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
