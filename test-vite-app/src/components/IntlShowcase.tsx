import { useState, useEffect } from 'react';
import { IntlProvider, FormattedMessage, useIntl } from 'react-intl';

// Import messages directly
import enUS from '../../public/locales/en-US.json';
import esMX from '../../public/locales/es-MX.json';
import frFR from '../../public/locales/fr-FR.json';

const localeOptions = [
  { code: 'en-US', name: 'English (US)', messages: enUS },
  { code: 'es-MX', name: 'Español (México)', messages: esMX },
  { code: 'fr-FR', name: 'Français (France)', messages: frFR }
];

function IntlContent() {
  const intl = useIntl();
  
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ color: '#8b5cf6', marginTop: 0 }}>
        <FormattedMessage id="welcome" />
      </h2>
      
      <p style={{ fontSize: '18px', color: '#6b7280', margin: '15px 0' }}>
        <FormattedMessage id="greeting" />
      </p>
      
      <p style={{ color: '#4b5563', marginBottom: '20px' }}>
        <FormattedMessage id="description" />
      </p>
      
      <div style={{ 
        background: '#f3f4f6',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <strong style={{ color: '#8b5cf6' }}>
          <FormattedMessage id="current_language" />
        </strong>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          <FormattedMessage id="switch_language" />
        </p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '10px' }}>
          {intl.formatMessage({ id: 'feature_ssr' })} ✅
        </p>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '10px' }}>
          {intl.formatMessage({ id: 'feature_i18n' })} ✅
        </p>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '10px' }}>
          {intl.formatMessage({ id: 'feature_auth' })} ✅
        </p>
      </div>
    </div>
  );
}

export default function IntlShowcase() {
  const [locale, setLocale] = useState('en-US');
  const [messages, setMessages] = useState<Record<string, string>>(enUS);

  function handleLocaleChange(newLocale: string) {
    console.log('🌍 Switching to locale:', newLocale);
    const option = localeOptions.find(opt => opt.code === newLocale);
    if (option) {
      setMessages(option.messages);
      setLocale(newLocale);
      console.log('✅ Locale changed to:', newLocale);
    }
  }

  return (
    <div style={{ 
      marginTop: '30px', 
      padding: '25px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid #8b5cf6',
      borderRadius: '12px',
      maxWidth: '600px',
      margin: '30px auto',
      color: 'white'
    }}>
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        color: '#1f2937'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#8b5cf6'
          }}>
            {messages.language}:
          </label>
          <select
            value={locale}
            onChange={(e) => handleLocaleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '2px solid #8b5cf6',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {localeOptions.map(opt => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <IntlProvider locale={locale} messages={messages}>
          <IntlContent />
        </IntlProvider>
      </div>

      <p style={{ fontSize: '12px', margin: '15px 0 0 0', textAlign: 'center' }}>
        ✨ Powered by @gasket/plugin-intl & react-intl
      </p>
    </div>
  );
}
