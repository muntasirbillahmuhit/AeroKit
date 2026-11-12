import React from 'react';
import { useApp } from './context/AppContext';
import { Toast } from './components/common/Toast';
import { SplashScreen } from './components/views/SplashScreen';
import { HomeScreen } from './components/views/HomeScreen';
import { CategoriesScreen } from './components/views/CategoriesScreen';
import { CategoryDetailScreen } from './components/views/CategoryDetailScreen';
import { FavoritesScreen } from './components/views/FavoritesScreen';
import { SettingsScreen } from './components/views/SettingsScreen';

// Tools
import { CalculatorView } from './components/tools/calculators/CalculatorView';
import { PercentageCalculatorView } from './components/tools/calculators/PercentageCalculatorView';
import { DateAgeCalculatorView } from './components/tools/calculators/DateAgeCalculatorView';

import { ExpenseTrackerView } from './components/tools/finance/ExpenseTrackerView';
import { CurrencyConverterView } from './components/tools/finance/CurrencyConverterView';
import { LoanEmiCalculatorView } from './components/tools/finance/LoanEmiCalculatorView';
import { DiscountCalculatorView } from './components/tools/finance/DiscountCalculatorView';
import { TipCalculatorView } from './components/tools/finance/TipCalculatorView';

import { UnitConverterView } from './components/tools/converters/UnitConverterView';
import { QrScannerView } from './components/tools/imageQr/QrScannerView';
import { QrGeneratorView } from './components/tools/imageQr/QrGeneratorView';
import { ImageToolsView } from './components/tools/imageQr/ImageToolsView';

import { NetworkToolsView } from './components/tools/network/NetworkToolsView';
import { TextToolsView } from './components/tools/textDevSec/TextToolsView';
import { DeveloperToolsView } from './components/tools/textDevSec/DeveloperToolsView';
import { SecurityToolsView } from './components/tools/textDevSec/SecurityToolsView';
import { DeviceInfoView } from './components/tools/textDevSec/DeviceInfoView';
import { DateTimeToolsView } from './components/tools/datetime/DateTimeToolsView';
import { MeasurementToolsView } from './components/tools/measurement/MeasurementToolsView';
import { LabPlaygroundView } from './components/tools/lab/LabPlaygroundView';
import { Icon } from './components/common/Icon';

export const AppContent: React.FC = () => {
  const { screen } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen />;
      case 'home':
        return <HomeScreen />;
      case 'cats':
        return <CategoriesScreen />;
      case 'cat-detail':
        return <CategoryDetailScreen />;
      case 'fav':
        return <FavoritesScreen />;
      case 'settings':
        return <SettingsScreen />;

      // Calculators
      case 'calc':
      case 'std-calc':
        return <CalculatorView initialMode="std" />;
      case 'sci-calc':
        return <CalculatorView initialMode="sci" />;
      case 'pct-calc':
        return <PercentageCalculatorView />;
      case 'age-calc':
        return <DateAgeCalculatorView />;

      // Finance
      case 'finance':
      case 'expense-tracker':
        return <ExpenseTrackerView />;
      case 'cur-conv':
        return <CurrencyConverterView />;
      case 'emi-calc':
        return <LoanEmiCalculatorView />;
      case 'disc-calc':
        return <DiscountCalculatorView />;
      case 'tip-calc':
        return <TipCalculatorView />;

      // Converters
      case 'unit':
      case 'unit-calc':
      case 'len-conv':
      case 'wt-conv':
      case 'temp-conv':
      case 'spd-conv':
      case 'data-conv':
      case 'area-conv':
      case 'vol-conv':
      case 'time-conv':
        return <UnitConverterView toolId={screen === 'unit' ? 'len-conv' : screen} />;

      // QR Tools
      case 'qr':
      case 'qr-scan':
        return <QrScannerView />;
      case 'qr-gen':
        return <QrGeneratorView initialType="text" />;
      case 'wifi-qr':
        return <QrGeneratorView initialType="wifi" />;
      case 'url-qr':
        return <QrGeneratorView initialType="url" />;
      case 'vcard-qr':
        return <QrGeneratorView initialType="vcard" />;

      // Image Tools
      case 'image':
      case 'img-compress':
      case 'img-resize':
      case 'color-picker':
      case 'img-base64':
      case 'format-conv':
      case 'crop-tool':
      case 'exif-data':
      case 'svg-opt':
      case 'barcode-scan':
        return <ImageToolsView toolId={screen === 'image' ? 'img-compress' : screen} />;

      // Network Tools
      case 'network':
      case 'internet-speed-tester':
      case 'internet-speed-test':
      case 'ip-lookup':
      case 'ping-latency':
      case 'dns-lookup':
        return <NetworkToolsView toolId={screen === 'network' ? 'internet-speed-tester' : screen} />;

      // Text Tools
      case 'text':
      case 'case-conv':
      case 'word-count':
      case 'lorem-gen':
      case 'url-enc':
      case 'base64-txt':
      case 'slug-gen':
      case 'line-clean':
      case 'diff-text':
        return <TextToolsView toolId={screen === 'text' ? 'case-conv' : screen} />;

      // Developer Tools
      case 'developer':
      case 'json-format':
      case 'uuid-gen':
      case 'hash-gen':
      case 'jwt-decode':
      case 'regex-test':
      case 'html-entity':
      case 'epoch-conv':
        return <DeveloperToolsView toolId={screen === 'developer' ? 'json-format' : screen} />;

      // Security Tools
      case 'security':
      case 'pwd-gen':
      case 'pwd-entropy':
      case 'sha256-chk':
      case 'privacy-chk':
      case 'secret-tokens':
      case 'passphrase-gen':
        return <SecurityToolsView toolId={screen === 'security' ? 'pwd-gen' : screen} />;

      // Device Info
      case 'device':
      case 'device-overview':
      case 'battery-status':
      case 'screen-display':
      case 'hardware-concurrency':
      case 'storage-quota':
        return <DeviceInfoView toolId={screen === 'device' ? 'device-overview' : screen} />;

      // Date & Time
      case 'datetime':
      case 'analog-clock':
      case 'digital-clock':
      case 'tz-conv':
      case 'calendar':
      case 'stopwatch':
      case 'timer':
      case 'pomodoro':
      case 'tally-counter':
        return <DateTimeToolsView toolId={screen === 'datetime' ? 'digital-clock' : screen} />;

      // Measurement
      case 'measurement':
      case 'ruler':
      case 'protractor':
      case 'spirit-level':
      case 'vibratometer':
      case 'pedometer':
      case 'pendulum':
      case 'sound-meter':
      case 'light-meter':
      case 'metal-detector':
        return <MeasurementToolsView toolId={screen === 'measurement' ? 'ruler' : screen} />;

      // Lab
      case 'lab':
      case 'programming':
      case 'html-play':
      case 'c-play':
      case 'python-play':
        return <LabPlaygroundView toolId={screen === 'lab' || screen === 'programming' ? 'html-play' : screen} />;

      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="app-container">
      <div className="app-viewport">
        <section className="ph on" id={`s-${screen}`}>
          <div className="in">
            <div className="screen-slide-in" key={screen}>
              {renderScreen()}
            </div>
          </div>
        </section>
      </div>

      <Toast />

      {/* Desktop Showcase Footer */}
      <footer className="foot glass">
        <div>
          <span className="lg">Aero<i>Kit</i></span>
        </div>
        <div>
          <Icon name="bolt" size={18} />
          <div>
            <b>Lightning Fast</b>
            <small>Pure Client-Side React SPA</small>
          </div>
        </div>
        <div>
          <Icon name="shield" size={18} />
          <div>
            <b>100% Private</b>
            <small>No Telemetry or Tracking</small>
          </div>
        </div>
        <div>
          <Icon name="spark" size={18} />
          <div>
            <b>75+ Utilities</b>
            <small>Calculators, Converters, Dev Tools</small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
