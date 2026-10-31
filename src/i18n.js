// Lightweight UI localization. English source strings remain the canonical
// keys, so an unset or unknown preference always renders the English interface.
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGES = Object.freeze([
  { code: 'en', native: 'English', english: 'English' },
  { code: 'zh-CN', native: '简体中文', english: 'Simplified Chinese' },
  { code: 'zh-TW', native: '繁體中文', english: 'Traditional Chinese' },
  { code: 'ja', native: '日本語', english: 'Japanese' },
  { code: 'ko', native: '한국어', english: 'Korean' },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'pt-BR', native: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
  { code: 'ru', native: 'Русский', english: 'Russian' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'it', native: 'Italiano', english: 'Italian' },
  { code: 'nl', native: 'Nederlands', english: 'Dutch' },
  { code: 'pl', native: 'Polski', english: 'Polish' },
  { code: 'tr', native: 'Türkçe', english: 'Turkish' },
  { code: 'id', native: 'Bahasa Indonesia', english: 'Indonesian' },
  { code: 'vi', native: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', native: 'ไทย', english: 'Thai' },
  { code: 'ms', native: 'Bahasa Melayu', english: 'Malay' },
  { code: 'fil', native: 'Filipino', english: 'Filipino' },
]);

const rows = [
  // Navigation and common actions.
  ['Home', '首页', '首頁', 'ホーム', '홈'],
  ['Inscriptions', '铭文', '銘文', 'インスクリプション', '인스크립션'],
  ['Activity', '活动', '活動', 'アクティビティ', '활동'],
  ['Settings', '设置', '設定', '設定', '설정'],
  ['Back', '返回', '返回', '戻る', '뒤로'],
  ['Close', '关闭', '關閉', '閉じる', '닫기'],
  ['Cancel', '取消', '取消', 'キャンセル', '취소'],
  ['Next', '下一步', '下一步', '次へ', '다음'],
  ['Save', '保存', '儲存', '保存', '저장'],
  ['Review', '复核', '複核', '確認', '검토'],
  ['Confirm', '确认', '確認', '確定', '확인'],
  ['Password', '密码', '密碼', 'パスワード', '비밀번호'],
  ['Wallet password', '钱包密码', '錢包密碼', 'ウォレットのパスワード', '지갑 비밀번호'],
  ['Checking password…', '正在验证密码…', '正在驗證密碼…', 'パスワードを確認中…', '비밀번호 확인 중…'],
  ['Broadcasting…', '正在广播…', '正在廣播…', 'ブロードキャスト中…', '브로드캐스트 중…'],
  ['Copy address', '复制地址', '複製地址', 'アドレスをコピー', '주소 복사'],
  ['Address copied', '地址已复制', '地址已複製', 'アドレスをコピーしました', '주소가 복사되었습니다'],
  ['Refresh', '刷新', '重新整理', '更新', '새로고침'],

  // Onboarding and lock screen.
  ['A silent Bitcoin wallet', '静默比特币钱包', '靜默比特幣錢包', 'サイレント・ビットコインウォレット', '사일런트 비트코인 지갑'],
  ['BTC, BRC-20 and inscriptions. Private by default.', '支持 BTC、BRC-20 和铭文，默认保护隐私。', '支援 BTC、BRC-20 和銘文，預設保護隱私。', 'BTC、BRC-20、インスクリプション。プライバシーを標準で保護。', 'BTC, BRC-20 및 인스크립션. 개인정보 보호가 기본입니다.'],
  ['Create a new wallet', '创建新钱包', '建立新錢包', '新しいウォレットを作成', '새 지갑 만들기'],
  ['Restore with 12 words', '使用 12 个单词恢复', '使用 12 個單詞還原', '12単語で復元', '12개 단어로 복구'],
  ['Unlock', '解锁', '解鎖', 'ロック解除', '잠금 해제'],
  ['Unlock your wallet', '解锁钱包', '解鎖錢包', 'ウォレットのロックを解除', '지갑 잠금 해제'],
  ['Wrong password.', '密码错误。', '密碼錯誤。', 'パスワードが正しくありません。', '비밀번호가 올바르지 않습니다.'],
  ['Your recovery phrase', '你的恢复短语', '你的復原短語', 'リカバリーフレーズ', '복구 문구'],
  ['Write these 12 words on paper, in order. Never share them.', '按顺序将这 12 个单词写在纸上，切勿分享。', '按順序將這 12 個單詞寫在紙上，切勿分享。', 'この12単語を順番に紙へ書き、絶対に共有しないでください。', '이 12개 단어를 순서대로 종이에 적고 절대 공유하지 마세요.'],
  ['I wrote down the 12 words', '我已记下这 12 个单词', '我已記下這 12 個單詞', '12単語を書き留めました', '12개 단어를 기록했습니다'],
  ['Continue', '继续', '繼續', '続ける', '계속'],
  ['Set a password', '设置密码', '設定密碼', 'パスワードを設定', '비밀번호 설정'],
  ['Locks the wallet on this device.', '用于锁定此设备上的钱包。', '用於鎖定此裝置上的錢包。', 'この端末上のウォレットをロックします。', '이 기기에서 지갑을 잠급니다.'],

  // Home.
  ['Silent wallet', '静默钱包', '靜默錢包', 'サイレントウォレット', '사일런트 지갑'],
  ['Total balance', '总余额', '總餘額', '合計残高', '총 잔액'],
  ['Receive', '接收', '接收', '受け取る', '받기'],
  ['Send', '发送', '傳送', '送る', '보내기'],
  ['Fund', '充值', '入金', '入金', '입금'],
  ['Bitcoin', '比特币', '比特幣', 'ビットコイン', '비트코인'],
  ['Manage', '管理', '管理', '管理', '관리'],
  ['Incoming deposit', '待确认充值', '待確認入金', '入金処理中', '입금 대기 중'],
  ['No activity yet', '暂无活动', '暫無活動', '履歴はまだありません', '아직 활동이 없습니다'],
  ['Your payments show up here.', '你的付款记录将显示在这里。', '你的付款記錄將顯示在這裡。', '支払い履歴がここに表示されます。', '결제 내역이 여기에 표시됩니다.'],
  ['Confirmed', '已确认', '已確認', '確認済み', '확인됨'],
  ['Pending', '待确认', '待確認', '保留中', '대기 중'],
  ['Sent', '已发送', '已傳送', '送信済み', '보냄'],
  ['Created inscription', '已创建铭文', '已建立銘文', 'インスクリプション作成', '인스크립션 생성'],
  ['Received inscription', '收到铭文', '收到銘文', 'インスクリプション受取', '인스크립션 받음'],
  ['Sent inscription', '已发送铭文', '已傳送銘文', 'インスクリプション送信', '인스크립션 보냄'],
  ['Synced', '已同步', '已同步', '同期済み', '동기화됨'],
  ['Live', '实时', '即時', 'ライブ', '실시간'],
  ['Up to date', '已是最新', '已是最新', '最新です', '최신 상태'],
  ['Loading…', '加载中…', '載入中…', '読み込み中…', '불러오는 중…'],

  // Inscription management.
  ['Bitcoin Ordinals and BRC-20', '比特币 Ordinals 与 BRC-20', '比特幣 Ordinals 與 BRC-20', 'Bitcoin Ordinals と BRC-20', '비트코인 Ordinals 및 BRC-20'],
  ['Inscribe', '铭刻', '銘刻', 'インスクライブ', '새기기'],
  ['Network', '网络', '網路', 'ネットワーク', '네트워크'],
  ['Ordinals', 'Ordinals', 'Ordinals', 'Ordinals', 'Ordinals'],
  ['Mint or transfer', '铸造或转账', '鑄造或轉帳', 'ミントまたは送付', '민팅 또는 전송'],
  ['Contracts and DeFi', '合约与 DeFi', '合約與 DeFi', 'コントラクトとDeFi', '컨트랙트 및 DeFi'],
  ['Call contract', '调用合约', '呼叫合約', 'コントラクトを呼び出す', '컨트랙트 호출'],
  ['Deploy contract', '部署合约', '部署合約', 'コントラクトをデプロイ', '컨트랙트 배포'],
  ['Contract address', '合约地址', '合約地址', 'コントラクトアドレス', '컨트랙트 주소'],
  ['Deployment inscription', '部署铭文', '部署銘文', 'デプロイ・インスクリプション', '배포 인스크립션'],
  ['Calldata', '调用数据', '呼叫資料', 'コールデータ', '호출 데이터'],
  ['Deployment data', '部署数据', '部署資料', 'デプロイデータ', '배포 데이터'],
  ['Protocol output', '协议输出', '協議輸出', 'プロトコル出力', '프로토콜 출력'],
  ['Silent change', '静默找零', '靜默找零', 'サイレントお釣り', '사일런트 거스름돈'],
  ['Enabled', '已启用', '已啟用', '有効', '활성화됨'],
  ['Text', '文本', '文字', 'テキスト', '텍스트'],
  ['Plain text', '纯文本', '純文字', 'プレーンテキスト', '일반 텍스트'],
  ['Image', '图片', '圖片', '画像', '이미지'],
  ['All', '全部', '全部', 'すべて', '전체'],
  ['BRC-20 assets', 'BRC-20 资产', 'BRC-20 資產', 'BRC-20 資産', 'BRC-20 자산'],
  ['Tap to transfer', '点击转账', '點擊轉帳', 'タップして送付', '눌러서 전송'],
  ['My inscriptions', '我的铭文', '我的銘文', 'マイ・インスクリプション', '내 인스크립션'],
  ['No inscriptions yet', '暂无铭文', '暫無銘文', 'インスクリプションはまだありません', '아직 인스크립션이 없습니다'],
  ['Create text, images or BRC-20 inscriptions from the center above.', '可通过上方中心创建文本、图片或 BRC-20 铭文。', '可透過上方中心建立文字、圖片或 BRC-20 銘文。', '上のセンターからテキスト、画像、BRC-20を作成できます。', '위 센터에서 텍스트, 이미지 또는 BRC-20 인스크립션을 만들 수 있습니다.'],
  ['Inscription center', '铭文中心', '銘文中心', 'インスクリプションセンター', '인스크립션 센터'],
  ['Create directly on Bitcoin', '直接在比特币上创建', '直接在比特幣上建立', 'Bitcoin上に直接作成', '비트코인에 직접 생성'],
  ['Mainnet', '主网', '主網', 'メインネット', '메인넷'],
  ['Mint', '铸造', '鑄造', 'ミント', '민팅'],
  ['Transfer', '转账', '轉帳', '送付', '전송'],
  ['Mint an existing BRC-20 token. Verify its ticker and mint limits before continuing.', '铸造现有 BRC-20 代币。继续前请核对代号和铸造限制。', '鑄造現有 BRC-20 代幣。繼續前請核對代號和鑄造限制。', '既存のBRC-20をミントします。続行前にティッカーと上限を確認してください。', '기존 BRC-20 토큰을 민팅합니다. 계속하기 전에 티커와 한도를 확인하세요.'],
  ['Ticker', '代号', '代號', 'ティッカー', '티커'],
  ['Ticker length', '代号长度', '代號長度', 'ティッカー長', '티커 길이'],
  ['Amount', '数量', '數量', '数量', '수량'],
  ['Amount per mint', '每次铸造数量', '每次鑄造數量', '1回あたりの数量', '민팅당 수량'],
  ['Number of mints', '铸造次数', '鑄造次數', 'ミント回数', '민팅 횟수'],
  ['Fee', '手续费', '手續費', '手数料', '수수료'],
  ['Recipient', '接收方', '接收方', '受取人', '수신자'],
  ['This wallet', '本钱包', '本錢包', 'このウォレット', '이 지갑'],
  ['Review BRC-20 mint', '复核 BRC-20 铸造', '複核 BRC-20 鑄造', 'BRC-20ミントを確認', 'BRC-20 민팅 검토'],
  ['BRC-20 transfers use two Bitcoin transactions: prepare the transfer inscription, then send it after confirmation.', 'BRC-20 转账需要两笔比特币交易：先准备转账铭文，确认后再发送。', 'BRC-20 轉帳需要兩筆比特幣交易：先準備轉帳銘文，確認後再傳送。', 'BRC-20送付は2段階です。転送インスクリプションを準備し、確認後に送ります。', 'BRC-20 전송은 두 단계입니다. 전송 인스크립션을 준비한 뒤 확인 후 보냅니다.'],
  ['Available to transfer', '可转账', '可轉帳', '送付可能', '전송 가능'],
  ['No transferable BRC-20', '没有可转账的 BRC-20', '沒有可轉帳的 BRC-20', '送付可能なBRC-20がありません', '전송 가능한 BRC-20이 없습니다'],
  ['Tokens with an available balance will appear here.', '有可用余额的代币将显示在这里。', '有可用餘額的代幣將顯示在這裡。', '利用可能残高のあるトークンがここに表示されます。', '사용 가능한 잔액이 있는 토큰이 여기에 표시됩니다.'],
  ['Plain text is stored permanently on Bitcoin. Do not include passwords, recovery phrases or personal information.', '纯文本将永久保存在比特币上。请勿包含密码、恢复短语或个人信息。', '純文字將永久保存在比特幣上。請勿包含密碼、復原短語或個人資訊。', 'テキストはBitcoin上に永久保存されます。パスワードや個人情報を含めないでください。', '텍스트는 비트코인에 영구 저장됩니다. 비밀번호, 복구 문구, 개인정보를 넣지 마세요.'],
  ['Enter the text to inscribe', '输入要铭刻的文本', '輸入要銘刻的文字', '刻むテキストを入力', '새길 텍스트 입력'],
  ['Number of copies', '副本数量', '副本數量', 'コピー数', '복사 수'],
  ['Review text inscription', '复核文本铭文', '複核文字銘文', 'テキストを確認', '텍스트 인스크립션 검토'],
  ['Choose images', '选择图片', '選擇圖片', '画像を選択', '이미지 선택'],
  ['No images selected', '尚未选择图片', '尚未選擇圖片', '画像が選択されていません', '선택한 이미지가 없습니다'],
  ['Review image inscription', '复核图片铭文', '複核圖片銘文', '画像を確認', '이미지 인스크립션 검토'],
  ['Content', '内容', '內容', '内容', '콘텐츠'],
  ['Your private wallet', '你的私密钱包', '你的私密錢包', 'プライベートウォレット', '개인 지갑'],
  ['Network fees', '网络手续费', '網路手續費', 'ネットワーク手数料', '네트워크 수수료'],
  ['Postage', '铭文附带金额', '銘文附帶金額', 'ポステージ', '포스티지'],
  ['Total', '合计', '合計', '合計', '합계'],
  ['Confirm & inscribe', '确认并铭刻', '確認並銘刻', '確認して刻む', '확인 후 새기기'],
  ['Broadcasting commit…', '正在广播提交交易…', '正在廣播提交交易…', 'コミットを送信中…', '커밋 전송 중…'],
  ['Inscribed ✓', '铭刻完成 ✓', '銘刻完成 ✓', '作成完了 ✓', '인스크립션 완료 ✓'],

  // Send and receive.
  ['Send BTC', '发送 BTC', '傳送 BTC', 'BTCを送る', 'BTC 보내기'],
  ['To', '接收地址', '接收地址', '送信先', '받는 주소'],
  ['Custom', '自定义', '自訂', 'カスタム', '사용자 지정'],
  ['Slow', '慢速', '慢速', '低速', '느림'],
  ['Normal', '普通', '普通', '標準', '보통'],
  ['Fast', '快速', '快速', '高速', '빠름'],
  ['Fund your wallet', '为钱包充值', '為錢包入金', 'ウォレットに入金', '지갑 입금'],
  ['Your silent payment address', '你的静默支付地址', '你的靜默支付地址', 'サイレントペイメントアドレス', '사일런트 결제 주소'],
  ['Inscription', '铭文', '銘文', 'インスクリプション', '인스크립션'],
  ['Send to', '发送到', '傳送到', '送信先', '보낼 주소'],

  // Settings.
  ['Wallet', '钱包', '錢包', 'ウォレット', '지갑'],
  ['Wallet name', '钱包名称', '錢包名稱', 'ウォレット名', '지갑 이름'],
  ['Language', '语言', '語言', '言語', '언어'],
  ['Choose display language. English is used by default.', '选择显示语言。默认使用英语。', '選擇顯示語言。預設使用英語。', '表示言語を選択します。初期設定は英語です。', '표시 언어를 선택하세요. 기본 언어는 영어입니다.'],
  ['Language changed', '语言已切换', '語言已切換', '言語を変更しました', '언어가 변경되었습니다'],
  ['Security', '安全', '安全', 'セキュリティ', '보안'],
  ['Auto-lock', '自动锁定', '自動鎖定', '自動ロック', '자동 잠금'],
  ['Recovery phrase', '恢复短语', '復原短語', 'リカバリーフレーズ', '복구 문구'],
  ['Extension', '扩展程序', '擴充功能', '拡張機能', '확장 프로그램'],
  ['Side panel', '侧边栏', '側邊欄', 'サイドパネル', '사이드 패널'],
  ['Connected sites', '已连接网站', '已連線網站', '接続済みサイト', '연결된 사이트'],
  ['Sync', '同步', '同步', '同期', '동기화'],
  ['Find missing tokens', '查找缺失代币', '尋找缺失代幣', '不足トークンを検索', '누락 토큰 찾기'],
  ['Rescan wallet', '重新扫描钱包', '重新掃描錢包', 'ウォレットを再スキャン', '지갑 다시 스캔'],
  ['Remove wallet', '移除钱包', '移除錢包', 'ウォレットを削除', '지갑 제거'],
  ['On', '开启', '開啟', 'オン', '켜짐'],
  ['Off', '关闭', '關閉', 'オフ', '꺼짐'],
  ['1 minute', '1 分钟', '1 分鐘', '1分', '1분'],
  ['5 minutes', '5 分钟', '5 分鐘', '5分', '5분'],
  ['15 minutes', '15 分钟', '15 分鐘', '15分', '15분'],
  ['30 minutes', '30 分钟', '30 分鐘', '30分', '30분'],
  ['1 hour', '1 小时', '1 小時', '1時間', '1시간'],
  ['4 hours', '4 小时', '4 小時', '4時間', '4시간'],
  ['Name saved', '名称已保存', '名稱已儲存', '名前を保存しました', '이름이 저장되었습니다'],
  ['Popup', '弹出窗口', '彈出視窗', 'ポップアップ', '팝업'],
  ['No sites connected yet.', '尚未连接网站。', '尚未連線網站。', '接続済みサイトはありません。', '연결된 사이트가 없습니다.'],
  ['Disconnect', '断开连接', '中斷連線', '切断', '연결 해제'],
  ['Disconnect all', '全部断开', '全部中斷', 'すべて切断', '모두 연결 해제'],
  ['Show phrase', '显示短语', '顯示短語', 'フレーズを表示', '문구 보기'],
  ['Check all now', '立即检查全部', '立即檢查全部', 'すべて確認', '모두 확인'],
  ['Rescan now', '立即重新扫描', '立即重新掃描', '今すぐ再スキャン', '지금 다시 스캔'],
];

const catalogs = Object.fromEntries(LANGUAGES.filter((language) => language.code !== 'en').map((language, index) => [
  language.code,
  new Map(rows.map((row) => [row[0], row[index + 1]])),
]));

// Regional packs cover the primary wallet navigation and the complete set of
// inscription protocol controls. Longer explanatory copy intentionally falls
// back to English until it has been human-reviewed.
const REGIONAL_KEYS = [
  'Home', 'Inscriptions', 'Activity', 'Settings', 'Back', 'Close', 'Cancel', 'Next', 'Review', 'Confirm',
  'Total balance', 'Receive', 'Send', 'Fund', 'Inscription center', 'Mint', 'Transfer', 'Text', 'Image', 'All',
  'Ticker', 'Ticker length', 'Amount', 'Fee', 'Recipient', 'Call contract', 'Deploy contract', 'Contract address',
  'Deployment data', 'Wallet', 'Wallet name', 'Language', 'Language changed', 'Security', 'Auto-lock',
  'Recovery phrase', 'Sync', 'Remove wallet',
];
const REGIONAL_TRANSLATIONS = {
  es: ['Inicio', 'Inscripciones', 'Actividad', 'Configuración', 'Atrás', 'Cerrar', 'Cancelar', 'Siguiente', 'Revisar', 'Confirmar', 'Saldo total', 'Recibir', 'Enviar', 'Depositar', 'Centro de inscripciones', 'Acuñar', 'Transferir', 'Texto', 'Imagen', 'Todos', 'Símbolo', 'Longitud del símbolo', 'Cantidad', 'Comisión', 'Destinatario', 'Llamar contrato', 'Desplegar contrato', 'Dirección del contrato', 'Datos de despliegue', 'Cartera', 'Nombre de la cartera', 'Idioma', 'Idioma cambiado', 'Seguridad', 'Bloqueo automático', 'Frase de recuperación', 'Sincronización', 'Eliminar cartera'],
  'pt-BR': ['Início', 'Inscrições', 'Atividade', 'Configurações', 'Voltar', 'Fechar', 'Cancelar', 'Próximo', 'Revisar', 'Confirmar', 'Saldo total', 'Receber', 'Enviar', 'Depositar', 'Central de inscrições', 'Cunhar', 'Transferir', 'Texto', 'Imagem', 'Todos', 'Símbolo', 'Comprimento do símbolo', 'Quantidade', 'Taxa', 'Destinatário', 'Chamar contrato', 'Implantar contrato', 'Endereço do contrato', 'Dados de implantação', 'Carteira', 'Nome da carteira', 'Idioma', 'Idioma alterado', 'Segurança', 'Bloqueio automático', 'Frase de recuperação', 'Sincronização', 'Remover carteira'],
  ru: ['Главная', 'Инскрипции', 'Активность', 'Настройки', 'Назад', 'Закрыть', 'Отмена', 'Далее', 'Проверить', 'Подтвердить', 'Общий баланс', 'Получить', 'Отправить', 'Пополнить', 'Центр инскрипций', 'Чеканить', 'Перевести', 'Текст', 'Изображение', 'Все', 'Тикер', 'Длина тикера', 'Сумма', 'Комиссия', 'Получатель', 'Вызвать контракт', 'Развернуть контракт', 'Адрес контракта', 'Данные развертывания', 'Кошелёк', 'Имя кошелька', 'Язык', 'Язык изменён', 'Безопасность', 'Автоблокировка', 'Фраза восстановления', 'Синхронизация', 'Удалить кошелёк'],
  fr: ['Accueil', 'Inscriptions', 'Activité', 'Paramètres', 'Retour', 'Fermer', 'Annuler', 'Suivant', 'Vérifier', 'Confirmer', 'Solde total', 'Recevoir', 'Envoyer', 'Approvisionner', 'Centre d’inscription', 'Émettre', 'Transférer', 'Texte', 'Image', 'Tous', 'Symbole', 'Longueur du symbole', 'Montant', 'Frais', 'Destinataire', 'Appeler le contrat', 'Déployer le contrat', 'Adresse du contrat', 'Données de déploiement', 'Portefeuille', 'Nom du portefeuille', 'Langue', 'Langue modifiée', 'Sécurité', 'Verrouillage automatique', 'Phrase de récupération', 'Synchronisation', 'Supprimer le portefeuille'],
  de: ['Start', 'Inschriften', 'Aktivität', 'Einstellungen', 'Zurück', 'Schließen', 'Abbrechen', 'Weiter', 'Prüfen', 'Bestätigen', 'Gesamtguthaben', 'Empfangen', 'Senden', 'Einzahlen', 'Inschriftencenter', 'Prägen', 'Übertragen', 'Text', 'Bild', 'Alle', 'Ticker', 'Tickerlänge', 'Betrag', 'Gebühr', 'Empfänger', 'Vertrag aufrufen', 'Vertrag bereitstellen', 'Vertragsadresse', 'Bereitstellungsdaten', 'Wallet', 'Wallet-Name', 'Sprache', 'Sprache geändert', 'Sicherheit', 'Automatische Sperre', 'Wiederherstellungsphrase', 'Synchronisierung', 'Wallet entfernen'],
  it: ['Home', 'Iscrizioni', 'Attività', 'Impostazioni', 'Indietro', 'Chiudi', 'Annulla', 'Avanti', 'Rivedi', 'Conferma', 'Saldo totale', 'Ricevi', 'Invia', 'Deposita', 'Centro iscrizioni', 'Conia', 'Trasferisci', 'Testo', 'Immagine', 'Tutti', 'Ticker', 'Lunghezza ticker', 'Importo', 'Commissione', 'Destinatario', 'Chiama contratto', 'Distribuisci contratto', 'Indirizzo contratto', 'Dati di distribuzione', 'Portafoglio', 'Nome portafoglio', 'Lingua', 'Lingua modificata', 'Sicurezza', 'Blocco automatico', 'Frase di recupero', 'Sincronizzazione', 'Rimuovi portafoglio'],
  nl: ['Start', 'Inscripties', 'Activiteit', 'Instellingen', 'Terug', 'Sluiten', 'Annuleren', 'Volgende', 'Controleren', 'Bevestigen', 'Totaalsaldo', 'Ontvangen', 'Verzenden', 'Storten', 'Inscriptiecentrum', 'Minten', 'Overdragen', 'Tekst', 'Afbeelding', 'Alles', 'Ticker', 'Tickerlengte', 'Bedrag', 'Kosten', 'Ontvanger', 'Contract aanroepen', 'Contract implementeren', 'Contractadres', 'Implementatiegegevens', 'Wallet', 'Walletnaam', 'Taal', 'Taal gewijzigd', 'Beveiliging', 'Automatisch vergrendelen', 'Herstelzin', 'Synchronisatie', 'Wallet verwijderen'],
  pl: ['Strona główna', 'Inskrypcje', 'Aktywność', 'Ustawienia', 'Wstecz', 'Zamknij', 'Anuluj', 'Dalej', 'Sprawdź', 'Potwierdź', 'Łączne saldo', 'Odbierz', 'Wyślij', 'Zasil', 'Centrum inskrypcji', 'Wybij', 'Przenieś', 'Tekst', 'Obraz', 'Wszystkie', 'Ticker', 'Długość tickera', 'Kwota', 'Opłata', 'Odbiorca', 'Wywołaj kontrakt', 'Wdróż kontrakt', 'Adres kontraktu', 'Dane wdrożenia', 'Portfel', 'Nazwa portfela', 'Język', 'Zmieniono język', 'Bezpieczeństwo', 'Automatyczna blokada', 'Fraza odzyskiwania', 'Synchronizacja', 'Usuń portfel'],
  tr: ['Ana Sayfa', 'Yazıtlar', 'Etkinlik', 'Ayarlar', 'Geri', 'Kapat', 'İptal', 'İleri', 'İncele', 'Onayla', 'Toplam bakiye', 'Al', 'Gönder', 'Fonla', 'Yazıt merkezi', 'Bas', 'Aktar', 'Metin', 'Görsel', 'Tümü', 'Sembol', 'Sembol uzunluğu', 'Tutar', 'Ücret', 'Alıcı', 'Sözleşmeyi çağır', 'Sözleşme dağıt', 'Sözleşme adresi', 'Dağıtım verisi', 'Cüzdan', 'Cüzdan adı', 'Dil', 'Dil değiştirildi', 'Güvenlik', 'Otomatik kilit', 'Kurtarma ifadesi', 'Senkronizasyon', 'Cüzdanı kaldır'],
  id: ['Beranda', 'Inskripsi', 'Aktivitas', 'Pengaturan', 'Kembali', 'Tutup', 'Batal', 'Berikutnya', 'Tinjau', 'Konfirmasi', 'Total saldo', 'Terima', 'Kirim', 'Isi dana', 'Pusat inskripsi', 'Cetak', 'Transfer', 'Teks', 'Gambar', 'Semua', 'Ticker', 'Panjang ticker', 'Jumlah', 'Biaya', 'Penerima', 'Panggil kontrak', 'Terapkan kontrak', 'Alamat kontrak', 'Data penerapan', 'Dompet', 'Nama dompet', 'Bahasa', 'Bahasa diubah', 'Keamanan', 'Kunci otomatis', 'Frasa pemulihan', 'Sinkronisasi', 'Hapus dompet'],
  vi: ['Trang chủ', 'Khắc dữ liệu', 'Hoạt động', 'Cài đặt', 'Quay lại', 'Đóng', 'Hủy', 'Tiếp theo', 'Xem lại', 'Xác nhận', 'Tổng số dư', 'Nhận', 'Gửi', 'Nạp tiền', 'Trung tâm khắc dữ liệu', 'Đúc', 'Chuyển', 'Văn bản', 'Hình ảnh', 'Tất cả', 'Mã token', 'Độ dài mã', 'Số lượng', 'Phí', 'Người nhận', 'Gọi hợp đồng', 'Triển khai hợp đồng', 'Địa chỉ hợp đồng', 'Dữ liệu triển khai', 'Ví', 'Tên ví', 'Ngôn ngữ', 'Đã đổi ngôn ngữ', 'Bảo mật', 'Tự động khóa', 'Cụm từ khôi phục', 'Đồng bộ', 'Xóa ví'],
  th: ['หน้าหลัก', 'จารึก', 'กิจกรรม', 'การตั้งค่า', 'ย้อนกลับ', 'ปิด', 'ยกเลิก', 'ถัดไป', 'ตรวจสอบ', 'ยืนยัน', 'ยอดรวม', 'รับ', 'ส่ง', 'เติมเงิน', 'ศูนย์จารึก', 'สร้างโทเค็น', 'โอน', 'ข้อความ', 'รูปภาพ', 'ทั้งหมด', 'สัญลักษณ์', 'ความยาวสัญลักษณ์', 'จำนวน', 'ค่าธรรมเนียม', 'ผู้รับ', 'เรียกสัญญา', 'ปรับใช้สัญญา', 'ที่อยู่สัญญา', 'ข้อมูลการปรับใช้', 'กระเป๋าเงิน', 'ชื่อกระเป๋าเงิน', 'ภาษา', 'เปลี่ยนภาษาแล้ว', 'ความปลอดภัย', 'ล็อกอัตโนมัติ', 'วลีกู้คืน', 'ซิงค์', 'ลบกระเป๋าเงิน'],
  ms: ['Utama', 'Inskripsi', 'Aktiviti', 'Tetapan', 'Kembali', 'Tutup', 'Batal', 'Seterusnya', 'Semak', 'Sahkan', 'Jumlah baki', 'Terima', 'Hantar', 'Tambah dana', 'Pusat inskripsi', 'Tempa', 'Pindah', 'Teks', 'Imej', 'Semua', 'Ticker', 'Panjang ticker', 'Amaun', 'Yuran', 'Penerima', 'Panggil kontrak', 'Laksana kontrak', 'Alamat kontrak', 'Data pelaksanaan', 'Dompet', 'Nama dompet', 'Bahasa', 'Bahasa ditukar', 'Keselamatan', 'Kunci automatik', 'Frasa pemulihan', 'Penyegerakan', 'Buang dompet'],
  fil: ['Home', 'Mga Inskripsiyon', 'Aktibidad', 'Mga Setting', 'Bumalik', 'Isara', 'Kanselahin', 'Susunod', 'Suriin', 'Kumpirmahin', 'Kabuuang balanse', 'Tumanggap', 'Magpadala', 'Maglagay ng pondo', 'Sentro ng inskripsiyon', 'Mag-mint', 'Ilipat', 'Teksto', 'Larawan', 'Lahat', 'Ticker', 'Haba ng ticker', 'Halaga', 'Bayad', 'Tatanggap', 'Tawagin ang kontrata', 'I-deploy ang kontrata', 'Address ng kontrata', 'Data ng deployment', 'Wallet', 'Pangalan ng wallet', 'Wika', 'Napalitan ang wika', 'Seguridad', 'Awtomatikong lock', 'Parirala sa pagbawi', 'Pag-sync', 'Alisin ang wallet'],
};
for (const [code, values] of Object.entries(REGIONAL_TRANSLATIONS)) {
  if (values.length !== REGIONAL_KEYS.length) throw new Error(`translation length mismatch for ${code}`);
  const catalog = catalogs[code];
  REGIONAL_KEYS.forEach((key, index) => catalog.set(key, values[index]));
}

// Market and password setup are complete product surfaces, so unlike legacy
// explanatory copy they must never fall back to English after a language has
// been selected. Groups keep the packs reviewable and make length mistakes a
// startup error instead of a partially translated interface.
const EXTRA_UI_KEYS = [
  ...`Market|Atomic inscription trading on Bitcoin|Refresh market|Sell|Listings|Settlement|Atomic BTC|Network fee|Seller keeps custody|A sale pays the seller and moves the inscription in one Bitcoin transaction. Miners always receive BTC.|shhhhh Sponsor online|shhhhh Sponsor not online yet|Explore|My listings|Loading market…|No active listings|The market is empty|Choose Sell to list one of your inscriptions.|The first signed listing will appear here.|Yours|Atomic sale|Buy`.split('|'),
  ...`Sell an inscription|Choose one item. It stays in your wallet until an atomic purchase confirms.|No inscription available|Listed, hidden and unconfirmed items are not shown.|Set a price|Price|Review listing|Sign & list|You receive|Listing fee|Free|Publishing…|Listed ✓|Manage listing|Cancel listing|listed price|Cancelling…|Listing cancelled ✓`.split('|'),
  ...`Buy inscription|You pay the miner fee|Sponsor pays miners in BTC|Sponsor not online|Pay network fee with|Miners receive BTC in both modes.|shhhhh is never converted silently and the wallet will not fall back without asking.|Bitcoin fee rate|Checking listing…|Review purchase|One step before buying|Prepare my wallet|Prepare to buy|one time|What|Split BTC into 3 wallet coins|Confirm & buy|Seller receives|Total BTC|Bought ✓`.split('|'),
  ...`Protect this wallet|Use at least 8 characters. You can show each password to check it.|Password (8+ characters)|Repeat password|Show password|Hide password|Create wallet|Encrypting…|Use at least 8 characters.|The passwords do not match.`.split('|'),
];
const extraPack = (...groups) => groups.flatMap((group) => group.split('|'));
const EXTRA_UI_TRANSLATIONS = {
  'zh-CN': extraPack(
    `市场|在比特币上原子交易铭文|刷新市场|出售|挂单|结算|BTC 原子结算|网络费|卖家自行保管|成交会在一笔比特币交易中同时付款给卖家并转移铭文。矿工始终收取 BTC。|shhhhh 赞助节点在线|shhhhh 赞助节点尚未上线|探索|我的挂单|正在加载市场…|没有有效挂单|市场暂无商品|选择“出售”来挂出你的铭文。|第一笔已签名挂单将显示在这里。|你的|原子成交|购买`,
    `出售铭文|选择一件铭文。原子购买确认前，它会一直留在你的钱包中。|没有可出售的铭文|已挂单、已隐藏和未确认的铭文不会显示。|设置价格|价格|复核挂单|签名并挂单|你将收到|挂单费|免费|正在发布…|已挂单 ✓|管理挂单|取消挂单|挂单价格|正在取消…|挂单已取消 ✓`,
    `购买铭文|你支付矿工费|赞助节点用 BTC 支付矿工费|赞助节点未上线|使用以下资产支付网络费|两种模式下矿工都收到 BTC。|shhhhh 绝不会被静默兑换，钱包也不会未经询问就改用 BTC。|比特币费率|正在检查挂单…|复核购买|购买前需要一步|准备我的钱包|准备购买|仅一次|操作|将 BTC 拆分为 3 个钱包 UTXO|确认并购买|卖家收到|BTC 总计|购买成功 ✓`,
    `保护此钱包|请使用至少 8 个字符。你可以显示每个密码进行核对。|密码（至少 8 个字符）|再次输入密码|显示密码|隐藏密码|创建钱包|正在加密…|请使用至少 8 个字符。|两次输入的密码不一致。`),
  'zh-TW': extraPack(
    `市場|在比特幣上原子交易銘文|重新整理市場|出售|掛單|結算|BTC 原子結算|網路費|賣家自行保管|成交會在一筆比特幣交易中同時付款給賣家並轉移銘文。礦工始終收取 BTC。|shhhhh 贊助節點上線|shhhhh 贊助節點尚未上線|探索|我的掛單|正在載入市場…|沒有有效掛單|市場暫無商品|選擇「出售」來掛出你的銘文。|第一筆已簽名掛單將顯示在這裡。|你的|原子成交|購買`,
    `出售銘文|選擇一件銘文。原子購買確認前，它會一直留在你的錢包中。|沒有可出售的銘文|已掛單、已隱藏和未確認的銘文不會顯示。|設定價格|價格|複核掛單|簽名並掛單|你將收到|掛單費|免費|正在發布…|已掛單 ✓|管理掛單|取消掛單|掛單價格|正在取消…|掛單已取消 ✓`,
    `購買銘文|你支付礦工費|贊助節點用 BTC 支付礦工費|贊助節點未上線|使用以下資產支付網路費|兩種模式下礦工都收到 BTC。|shhhhh 絕不會被靜默兌換，錢包也不會未經詢問就改用 BTC。|比特幣費率|正在檢查掛單…|複核購買|購買前需要一步|準備我的錢包|準備購買|僅一次|操作|將 BTC 拆分為 3 個錢包 UTXO|確認並購買|賣家收到|BTC 總計|購買成功 ✓`,
    `保護此錢包|請使用至少 8 個字元。你可以顯示每個密碼進行核對。|密碼（至少 8 個字元）|再次輸入密碼|顯示密碼|隱藏密碼|建立錢包|正在加密…|請使用至少 8 個字元。|兩次輸入的密碼不一致。`),
  ja: extraPack(
    `マーケット|Bitcoin上のアトミックなインスクリプション取引|マーケットを更新|出品|出品数|決済|BTCアトミック決済|ネットワーク手数料|売り手が資産を保管|1つのBitcoin取引で売り手への支払いとインスクリプションの移転を同時に行います。マイナーは常にBTCを受け取ります。|shhhhhスポンサー稼働中|shhhhhスポンサーはまだ未稼働|探す|自分の出品|マーケットを読み込み中…|有効な出品はありません|マーケットは空です|「出品」からインスクリプションを出品してください。|最初の署名済み出品がここに表示されます。|あなたの出品|アトミック取引|購入`,
    `インスクリプションを出品|1点選択してください。アトミック購入が承認されるまでウォレット内に残ります。|出品可能なインスクリプションがありません|出品済み、非表示、未承認の項目は表示されません。|価格を設定|価格|出品内容を確認|署名して出品|受取額|出品手数料|無料|公開中…|出品しました ✓|出品を管理|出品を取り消す|出品価格|取消中…|出品を取り消しました ✓`,
    `インスクリプションを購入|マイナー手数料を支払う|スポンサーがBTCでマイナーに支払う|スポンサー未稼働|ネットワーク手数料の支払方法|どちらの方法でもマイナーはBTCを受け取ります。|shhhhhが黙って換金されたり、確認なしでBTC支払いに切り替わることはありません。|Bitcoin手数料率|出品を確認中…|購入内容を確認|購入前の準備|ウォレットを準備|購入準備|初回のみ|内容|BTCをウォレット内の3つのUTXOに分割|確認して購入|売り手の受取額|BTC合計|購入完了 ✓`,
    `このウォレットを保護|8文字以上を使用してください。各パスワードを表示して確認できます。|パスワード（8文字以上）|パスワードを再入力|パスワードを表示|パスワードを隠す|ウォレットを作成|暗号化中…|8文字以上を使用してください。|パスワードが一致しません。`),
  ko: extraPack(
    `마켓|비트코인 기반 아토믹 인스크립션 거래|마켓 새로고침|판매|등록 수|결제|BTC 아토믹 결제|네트워크 수수료|판매자 직접 보관|한 번의 비트코인 거래에서 판매자 결제와 인스크립션 이전이 함께 이뤄집니다. 채굴자는 항상 BTC를 받습니다.|shhhhh 스폰서 온라인|shhhhh 스폰서 준비 중|탐색|내 등록|마켓 불러오는 중…|활성 등록 없음|마켓이 비어 있습니다|판매를 눌러 인스크립션을 등록하세요.|첫 서명 등록이 여기에 표시됩니다.|내 것|아토믹 거래|구매`,
    `인스크립션 판매|항목 하나를 선택하세요. 아토믹 구매가 확인될 때까지 지갑에 남습니다.|판매 가능한 인스크립션 없음|등록됨, 숨김 및 미확인 항목은 표시되지 않습니다.|가격 설정|가격|등록 검토|서명 후 등록|받을 금액|등록 수수료|무료|게시 중…|등록 완료 ✓|등록 관리|등록 취소|등록 가격|취소 중…|등록 취소 완료 ✓`,
    `인스크립션 구매|채굴 수수료 직접 지불|스폰서가 BTC로 채굴자에게 지불|스폰서 준비 중|네트워크 수수료 결제 수단|두 방식 모두 채굴자는 BTC를 받습니다.|shhhhh는 몰래 환전되지 않으며 지갑이 묻지 않고 BTC로 전환하지 않습니다.|비트코인 수수료율|등록 확인 중…|구매 검토|구매 전 한 단계|내 지갑 준비|구매 준비|한 번만|내용|BTC를 지갑 UTXO 3개로 분할|확인 후 구매|판매자 수령액|총 BTC|구매 완료 ✓`,
    `이 지갑 보호|8자 이상을 사용하세요. 각 비밀번호를 표시해 확인할 수 있습니다.|비밀번호(8자 이상)|비밀번호 다시 입력|비밀번호 표시|비밀번호 숨기기|지갑 만들기|암호화 중…|8자 이상을 사용하세요.|비밀번호가 일치하지 않습니다.`),
  es: extraPack(
    `Mercado|Comercio atómico de inscripciones en Bitcoin|Actualizar mercado|Vender|Anuncios|Liquidación|BTC atómico|Comisión de red|El vendedor conserva la custodia|La venta paga al vendedor y transfiere la inscripción en una sola transacción de Bitcoin. Los mineros siempre reciben BTC.|Patrocinador shhhhh activo|Patrocinador shhhhh aún no disponible|Explorar|Mis anuncios|Cargando mercado…|No hay anuncios activos|El mercado está vacío|Pulsa Vender para anunciar una inscripción.|El primer anuncio firmado aparecerá aquí.|Tuyo|Venta atómica|Comprar`,
    `Vender una inscripción|Elige un artículo. Permanecerá en tu cartera hasta que se confirme la compra atómica.|No hay inscripciones disponibles|No se muestran artículos anunciados, ocultos o sin confirmar.|Fijar precio|Precio|Revisar anuncio|Firmar y anunciar|Recibes|Comisión de anuncio|Gratis|Publicando…|Anunciado ✓|Gestionar anuncio|Cancelar anuncio|precio anunciado|Cancelando…|Anuncio cancelado ✓`,
    `Comprar inscripción|Tú pagas la comisión minera|El patrocinador paga a los mineros en BTC|Patrocinador no disponible|Pagar la comisión de red con|Los mineros reciben BTC en ambos modos.|shhhhh nunca se convierte sin avisar y la cartera no usará BTC sin preguntarte.|Tarifa de Bitcoin|Comprobando anuncio…|Revisar compra|Un paso antes de comprar|Preparar mi cartera|Preparar compra|una sola vez|Acción|Dividir BTC en 3 UTXO de la cartera|Confirmar y comprar|El vendedor recibe|BTC total|Comprado ✓`,
    `Protege esta cartera|Usa al menos 8 caracteres. Puedes mostrar cada contraseña para comprobarla.|Contraseña (8+ caracteres)|Repetir contraseña|Mostrar contraseña|Ocultar contraseña|Crear cartera|Cifrando…|Usa al menos 8 caracteres.|Las contraseñas no coinciden.`),
  'pt-BR': extraPack(
    `Mercado|Negociação atômica de inscrições no Bitcoin|Atualizar mercado|Vender|Anúncios|Liquidação|BTC atômico|Taxa de rede|O vendedor mantém a custódia|A venda paga o vendedor e transfere a inscrição em uma única transação Bitcoin. Mineradores sempre recebem BTC.|Patrocinador shhhhh ativo|Patrocinador shhhhh ainda indisponível|Explorar|Meus anúncios|Carregando mercado…|Nenhum anúncio ativo|O mercado está vazio|Selecione Vender para anunciar uma inscrição.|O primeiro anúncio assinado aparecerá aqui.|Seu|Venda atômica|Comprar`,
    `Vender uma inscrição|Escolha um item. Ele fica na sua carteira até a compra atômica ser confirmada.|Nenhuma inscrição disponível|Itens anunciados, ocultos ou não confirmados não são exibidos.|Definir preço|Preço|Revisar anúncio|Assinar e anunciar|Você recebe|Taxa de anúncio|Grátis|Publicando…|Anunciado ✓|Gerenciar anúncio|Cancelar anúncio|preço anunciado|Cancelando…|Anúncio cancelado ✓`,
    `Comprar inscrição|Você paga a taxa do minerador|O patrocinador paga mineradores em BTC|Patrocinador indisponível|Pagar taxa de rede com|Mineradores recebem BTC nos dois modos.|shhhhh nunca é convertido silenciosamente e a carteira não muda para BTC sem perguntar.|Taxa do Bitcoin|Verificando anúncio…|Revisar compra|Um passo antes de comprar|Preparar minha carteira|Preparar compra|uma vez|Ação|Dividir BTC em 3 UTXOs da carteira|Confirmar e comprar|Vendedor recebe|Total em BTC|Comprado ✓`,
    `Proteja esta carteira|Use pelo menos 8 caracteres. Você pode exibir cada senha para conferi-la.|Senha (8+ caracteres)|Repetir senha|Mostrar senha|Ocultar senha|Criar carteira|Criptografando…|Use pelo menos 8 caracteres.|As senhas não coincidem.`),
  ru: extraPack(
    `Маркет|Атомарная торговля инскрипциями в Bitcoin|Обновить маркет|Продать|Лоты|Расчёт|Атомарно в BTC|Комиссия сети|Хранение остаётся у продавца|Продажа оплачивает продавца и передаёт инскрипцию одной транзакцией Bitcoin. Майнеры всегда получают BTC.|Спонсор shhhhh работает|Спонсор shhhhh пока недоступен|Обзор|Мои лоты|Загрузка маркета…|Нет активных лотов|Маркет пуст|Нажмите Продать, чтобы выставить инскрипцию.|Первый подписанный лот появится здесь.|Ваш|Атомарная продажа|Купить`,
    `Продать инскрипцию|Выберите объект. Он останется в кошельке до подтверждения атомарной покупки.|Нет доступных инскрипций|Выставленные, скрытые и неподтверждённые объекты не показаны.|Установить цену|Цена|Проверить лот|Подписать и выставить|Вы получите|Комиссия за лот|Бесплатно|Публикация…|Выставлено ✓|Управление лотом|Отменить лот|цена лота|Отмена…|Лот отменён ✓`,
    `Купить инскрипцию|Вы платите комиссию майнеру|Спонсор платит майнерам в BTC|Спонсор недоступен|Оплатить комиссию сети с помощью|В обоих режимах майнеры получают BTC.|shhhhh не конвертируется скрытно, и кошелёк не переключится на BTC без вопроса.|Ставка комиссии Bitcoin|Проверка лота…|Проверить покупку|Шаг перед покупкой|Подготовить кошелёк|Подготовить покупку|один раз|Действие|Разделить BTC на 3 UTXO кошелька|Подтвердить и купить|Продавец получит|Всего BTC|Куплено ✓`,
    `Защитите кошелёк|Используйте не менее 8 символов. Каждый пароль можно показать для проверки.|Пароль (8+ символов)|Повторите пароль|Показать пароль|Скрыть пароль|Создать кошелёк|Шифрование…|Используйте не менее 8 символов.|Пароли не совпадают.`),
  fr: extraPack(
    `Marché|Échange atomique d’inscriptions sur Bitcoin|Actualiser le marché|Vendre|Annonces|Règlement|BTC atomique|Frais réseau|Le vendeur garde la possession|La vente paie le vendeur et transfère l’inscription dans une seule transaction Bitcoin. Les mineurs reçoivent toujours du BTC.|Sponsor shhhhh en ligne|Sponsor shhhhh pas encore disponible|Explorer|Mes annonces|Chargement du marché…|Aucune annonce active|Le marché est vide|Choisissez Vendre pour publier une inscription.|La première annonce signée apparaîtra ici.|À vous|Vente atomique|Acheter`,
    `Vendre une inscription|Choisissez un objet. Il reste dans votre portefeuille jusqu’à la confirmation de l’achat atomique.|Aucune inscription disponible|Les objets publiés, masqués ou non confirmés ne sont pas affichés.|Définir le prix|Prix|Vérifier l’annonce|Signer et publier|Vous recevez|Frais d’annonce|Gratuit|Publication…|Publié ✓|Gérer l’annonce|Annuler l’annonce|prix affiché|Annulation…|Annonce annulée ✓`,
    `Acheter l’inscription|Vous payez les frais mineur|Le sponsor paie les mineurs en BTC|Sponsor indisponible|Payer les frais réseau avec|Les mineurs reçoivent du BTC dans les deux modes.|shhhhh n’est jamais converti discrètement et le portefeuille ne passe pas au BTC sans demander.|Taux de frais Bitcoin|Vérification de l’annonce…|Vérifier l’achat|Une étape avant l’achat|Préparer mon portefeuille|Préparer l’achat|une seule fois|Action|Diviser le BTC en 3 UTXO du portefeuille|Confirmer et acheter|Le vendeur reçoit|Total BTC|Acheté ✓`,
    `Protégez ce portefeuille|Utilisez au moins 8 caractères. Vous pouvez afficher chaque mot de passe pour le vérifier.|Mot de passe (8+ caractères)|Répéter le mot de passe|Afficher le mot de passe|Masquer le mot de passe|Créer le portefeuille|Chiffrement…|Utilisez au moins 8 caractères.|Les mots de passe ne correspondent pas.`),
  de: extraPack(
    `Markt|Atomarer Handel mit Inschriften auf Bitcoin|Markt aktualisieren|Verkaufen|Angebote|Abwicklung|Atomar in BTC|Netzwerkgebühr|Verkäufer behält die Verwahrung|Der Verkauf bezahlt den Verkäufer und überträgt die Inschrift in einer Bitcoin-Transaktion. Miner erhalten immer BTC.|shhhhh-Sponsor online|shhhhh-Sponsor noch nicht verfügbar|Entdecken|Meine Angebote|Markt wird geladen…|Keine aktiven Angebote|Der Markt ist leer|Wähle Verkaufen, um eine Inschrift anzubieten.|Das erste signierte Angebot erscheint hier.|Deins|Atomarer Verkauf|Kaufen`,
    `Inschrift verkaufen|Wähle einen Artikel. Er bleibt bis zur Bestätigung des atomaren Kaufs in deiner Wallet.|Keine Inschrift verfügbar|Angebotene, ausgeblendete und unbestätigte Artikel werden nicht angezeigt.|Preis festlegen|Preis|Angebot prüfen|Signieren und anbieten|Du erhältst|Angebotsgebühr|Kostenlos|Veröffentlichen…|Angeboten ✓|Angebot verwalten|Angebot stornieren|Angebotspreis|Stornieren…|Angebot storniert ✓`,
    `Inschrift kaufen|Du zahlst die Minergebühr|Sponsor zahlt Miner in BTC|Sponsor nicht verfügbar|Netzwerkgebühr bezahlen mit|Miner erhalten in beiden Modi BTC.|shhhhh wird nie still umgewandelt und die Wallet wechselt nicht ohne Nachfrage zu BTC.|Bitcoin-Gebührensatz|Angebot wird geprüft…|Kauf prüfen|Ein Schritt vor dem Kauf|Wallet vorbereiten|Kauf vorbereiten|einmalig|Aktion|BTC in 3 Wallet-UTXOs aufteilen|Bestätigen und kaufen|Verkäufer erhält|BTC gesamt|Gekauft ✓`,
    `Diese Wallet schützen|Verwende mindestens 8 Zeichen. Du kannst jedes Passwort zur Prüfung anzeigen.|Passwort (8+ Zeichen)|Passwort wiederholen|Passwort anzeigen|Passwort ausblenden|Wallet erstellen|Verschlüsseln…|Verwende mindestens 8 Zeichen.|Die Passwörter stimmen nicht überein.`),
  it: extraPack(
    `Mercato|Scambio atomico di iscrizioni su Bitcoin|Aggiorna mercato|Vendi|Annunci|Regolamento|BTC atomico|Commissione di rete|Il venditore mantiene la custodia|La vendita paga il venditore e trasferisce l’iscrizione in una sola transazione Bitcoin. I miner ricevono sempre BTC.|Sponsor shhhhh online|Sponsor shhhhh non ancora disponibile|Esplora|I miei annunci|Caricamento mercato…|Nessun annuncio attivo|Il mercato è vuoto|Scegli Vendi per pubblicare un’iscrizione.|Il primo annuncio firmato apparirà qui.|Tuo|Vendita atomica|Compra`,
    `Vendi un’iscrizione|Scegli un oggetto. Resta nel tuo wallet fino alla conferma dell’acquisto atomico.|Nessuna iscrizione disponibile|Gli oggetti pubblicati, nascosti e non confermati non vengono mostrati.|Imposta prezzo|Prezzo|Rivedi annuncio|Firma e pubblica|Ricevi|Commissione annuncio|Gratis|Pubblicazione…|Pubblicato ✓|Gestisci annuncio|Annulla annuncio|prezzo pubblicato|Annullamento…|Annuncio annullato ✓`,
    `Compra iscrizione|Paghi la commissione miner|Lo sponsor paga i miner in BTC|Sponsor non disponibile|Paga la commissione di rete con|I miner ricevono BTC in entrambe le modalità.|shhhhh non viene mai convertito di nascosto e il wallet non passa a BTC senza chiedere.|Tariffa Bitcoin|Verifica annuncio…|Rivedi acquisto|Un passaggio prima dell’acquisto|Prepara il wallet|Prepara acquisto|una volta|Azione|Dividi BTC in 3 UTXO del wallet|Conferma e compra|Il venditore riceve|Totale BTC|Acquistato ✓`,
    `Proteggi questo wallet|Usa almeno 8 caratteri. Puoi mostrare ogni password per verificarla.|Password (8+ caratteri)|Ripeti password|Mostra password|Nascondi password|Crea wallet|Crittografia…|Usa almeno 8 caratteri.|Le password non corrispondono.`),
  nl: extraPack(
    `Markt|Atomaire handel in inscripties op Bitcoin|Markt vernieuwen|Verkopen|Aanbiedingen|Afwikkeling|Atomair BTC|Netwerkkosten|Verkoper houdt beheer|De verkoop betaalt de verkoper en verplaatst de inscriptie in één Bitcoin-transactie. Miners ontvangen altijd BTC.|shhhhh-sponsor online|shhhhh-sponsor nog niet beschikbaar|Ontdekken|Mijn aanbiedingen|Markt laden…|Geen actieve aanbiedingen|De markt is leeg|Kies Verkopen om een inscriptie aan te bieden.|De eerste ondertekende aanbieding verschijnt hier.|Van jou|Atomaire verkoop|Kopen`,
    `Inscriptie verkopen|Kies één item. Het blijft in je wallet tot de atomaire aankoop is bevestigd.|Geen inscriptie beschikbaar|Aangeboden, verborgen en onbevestigde items worden niet getoond.|Prijs instellen|Prijs|Aanbieding controleren|Ondertekenen en aanbieden|Je ontvangt|Aanbiedingskosten|Gratis|Publiceren…|Aangeboden ✓|Aanbieding beheren|Aanbieding annuleren|vraagprijs|Annuleren…|Aanbieding geannuleerd ✓`,
    `Inscriptie kopen|Jij betaalt de minerfee|Sponsor betaalt miners in BTC|Sponsor niet beschikbaar|Netwerkkosten betalen met|Miners ontvangen in beide modi BTC.|shhhhh wordt nooit stil omgezet en de wallet schakelt niet zonder te vragen naar BTC.|Bitcoin-tarief|Aanbieding controleren…|Aankoop controleren|Eén stap voor aankoop|Mijn wallet voorbereiden|Aankoop voorbereiden|eenmalig|Actie|BTC splitsen in 3 wallet-UTXO’s|Bevestigen en kopen|Verkoper ontvangt|Totaal BTC|Gekocht ✓`,
    `Bescherm deze wallet|Gebruik minstens 8 tekens. Je kunt elk wachtwoord tonen om het te controleren.|Wachtwoord (8+ tekens)|Wachtwoord herhalen|Wachtwoord tonen|Wachtwoord verbergen|Wallet maken|Versleutelen…|Gebruik minstens 8 tekens.|De wachtwoorden komen niet overeen.`),
  pl: extraPack(
    `Rynek|Atomowy handel inskrypcjami w Bitcoin|Odśwież rynek|Sprzedaj|Oferty|Rozliczenie|Atomowe BTC|Opłata sieciowa|Sprzedawca zachowuje kontrolę|Sprzedaż płaci sprzedawcy i przenosi inskrypcję w jednej transakcji Bitcoin. Górnicy zawsze otrzymują BTC.|Sponsor shhhhh online|Sponsor shhhhh jeszcze niedostępny|Przeglądaj|Moje oferty|Ładowanie rynku…|Brak aktywnych ofert|Rynek jest pusty|Wybierz Sprzedaj, aby wystawić inskrypcję.|Pierwsza podpisana oferta pojawi się tutaj.|Twoja|Sprzedaż atomowa|Kup`,
    `Sprzedaj inskrypcję|Wybierz element. Pozostanie w portfelu do potwierdzenia atomowego zakupu.|Brak dostępnej inskrypcji|Wystawione, ukryte i niepotwierdzone elementy nie są pokazywane.|Ustaw cenę|Cena|Sprawdź ofertę|Podpisz i wystaw|Otrzymasz|Opłata za ofertę|Bezpłatnie|Publikowanie…|Wystawiono ✓|Zarządzaj ofertą|Anuluj ofertę|cena oferty|Anulowanie…|Oferta anulowana ✓`,
    `Kup inskrypcję|Płacisz opłatę górniczą|Sponsor płaci górnikom w BTC|Sponsor niedostępny|Zapłać opłatę sieciową przez|Górnicy otrzymują BTC w obu trybach.|shhhhh nigdy nie jest potajemnie wymieniany, a portfel nie przełączy się na BTC bez pytania.|Stawka Bitcoin|Sprawdzanie oferty…|Sprawdź zakup|Krok przed zakupem|Przygotuj portfel|Przygotuj zakup|jednorazowo|Działanie|Podziel BTC na 3 UTXO portfela|Potwierdź i kup|Sprzedawca otrzyma|Razem BTC|Kupiono ✓`,
    `Chroń ten portfel|Użyj co najmniej 8 znaków. Możesz wyświetlić każde hasło, aby je sprawdzić.|Hasło (8+ znaków)|Powtórz hasło|Pokaż hasło|Ukryj hasło|Utwórz portfel|Szyfrowanie…|Użyj co najmniej 8 znaków.|Hasła nie są zgodne.`),
  tr: extraPack(
    `Pazar|Bitcoin üzerinde atomik yazıt ticareti|Pazarı yenile|Sat|İlanlar|Takas|Atomik BTC|Ağ ücreti|Satıcı saklamayı sürdürür|Satış, satıcıya ödeme yapar ve yazıtı tek bir Bitcoin işleminde taşır. Madenciler her zaman BTC alır.|shhhhh sponsoru çevrimiçi|shhhhh sponsoru henüz hazır değil|Keşfet|İlanlarım|Pazar yükleniyor…|Etkin ilan yok|Pazar boş|Bir yazıtı listelemek için Sat seçeneğini kullanın.|İlk imzalı ilan burada görünecek.|Senin|Atomik satış|Satın al`,
    `Yazıt sat|Bir öğe seçin. Atomik satın alma onaylanana kadar cüzdanınızda kalır.|Uygun yazıt yok|Listelenen, gizli ve onaysız öğeler gösterilmez.|Fiyat belirle|Fiyat|İlanı incele|İmzala ve listele|Alacağınız|İlan ücreti|Ücretsiz|Yayınlanıyor…|Listelendi ✓|İlanı yönet|İlanı iptal et|ilan fiyatı|İptal ediliyor…|İlan iptal edildi ✓`,
    `Yazıt satın al|Madenci ücretini siz ödersiniz|Sponsor madencilere BTC öder|Sponsor hazır değil|Ağ ücretini şununla öde|Her iki modda da madenciler BTC alır.|shhhhh sessizce dönüştürülmez ve cüzdan sormadan BTC’ye geçmez.|Bitcoin ücret oranı|İlan kontrol ediliyor…|Satın almayı incele|Satın almadan önce bir adım|Cüzdanımı hazırla|Satın almaya hazırlan|tek sefer|İşlem|BTC’yi 3 cüzdan UTXO’suna böl|Onayla ve satın al|Satıcı alır|Toplam BTC|Satın alındı ✓`,
    `Bu cüzdanı koru|En az 8 karakter kullanın. Kontrol etmek için her parolayı gösterebilirsiniz.|Parola (8+ karakter)|Parolayı tekrarla|Parolayı göster|Parolayı gizle|Cüzdan oluştur|Şifreleniyor…|En az 8 karakter kullanın.|Parolalar eşleşmiyor.`),
  id: extraPack(
    `Pasar|Perdagangan inskripsi atomik di Bitcoin|Segarkan pasar|Jual|Daftar|Penyelesaian|BTC atomik|Biaya jaringan|Penjual tetap memegang aset|Penjualan membayar penjual dan memindahkan inskripsi dalam satu transaksi Bitcoin. Penambang selalu menerima BTC.|Sponsor shhhhh aktif|Sponsor shhhhh belum tersedia|Jelajahi|Daftar saya|Memuat pasar…|Tidak ada daftar aktif|Pasar kosong|Pilih Jual untuk mendaftarkan inskripsi.|Daftar bertanda tangan pertama akan muncul di sini.|Milik Anda|Penjualan atomik|Beli`,
    `Jual inskripsi|Pilih satu item. Item tetap di dompet sampai pembelian atomik dikonfirmasi.|Tidak ada inskripsi tersedia|Item terdaftar, tersembunyi, dan belum dikonfirmasi tidak ditampilkan.|Tetapkan harga|Harga|Tinjau daftar|Tandatangani dan daftar|Anda menerima|Biaya daftar|Gratis|Menerbitkan…|Terdaftar ✓|Kelola daftar|Batalkan daftar|harga daftar|Membatalkan…|Daftar dibatalkan ✓`,
    `Beli inskripsi|Anda membayar biaya penambang|Sponsor membayar penambang dengan BTC|Sponsor belum tersedia|Bayar biaya jaringan dengan|Penambang menerima BTC di kedua mode.|shhhhh tidak pernah dikonversi diam-diam dan dompet tidak beralih ke BTC tanpa bertanya.|Tarif Bitcoin|Memeriksa daftar…|Tinjau pembelian|Satu langkah sebelum membeli|Siapkan dompet saya|Siapkan pembelian|satu kali|Tindakan|Bagi BTC menjadi 3 UTXO dompet|Konfirmasi dan beli|Penjual menerima|Total BTC|Dibeli ✓`,
    `Lindungi dompet ini|Gunakan minimal 8 karakter. Anda dapat menampilkan setiap kata sandi untuk memeriksanya.|Kata sandi (8+ karakter)|Ulangi kata sandi|Tampilkan kata sandi|Sembunyikan kata sandi|Buat dompet|Mengenkripsi…|Gunakan minimal 8 karakter.|Kata sandi tidak cocok.`),
  vi: extraPack(
    `Chợ|Giao dịch bản khắc nguyên tử trên Bitcoin|Làm mới chợ|Bán|Tin đăng|Thanh toán|BTC nguyên tử|Phí mạng|Người bán giữ quyền quản lý|Giao dịch trả tiền cho người bán và chuyển bản khắc trong một giao dịch Bitcoin. Thợ đào luôn nhận BTC.|Nhà tài trợ shhhhh trực tuyến|Nhà tài trợ shhhhh chưa sẵn sàng|Khám phá|Tin của tôi|Đang tải chợ…|Không có tin đang hoạt động|Chợ đang trống|Chọn Bán để đăng một bản khắc.|Tin đã ký đầu tiên sẽ xuất hiện tại đây.|Của bạn|Bán nguyên tử|Mua`,
    `Bán bản khắc|Chọn một mục. Mục vẫn ở trong ví cho đến khi giao dịch mua nguyên tử được xác nhận.|Không có bản khắc khả dụng|Không hiển thị mục đã đăng, đã ẩn hoặc chưa xác nhận.|Đặt giá|Giá|Xem lại tin|Ký và đăng|Bạn nhận|Phí đăng|Miễn phí|Đang đăng…|Đã đăng ✓|Quản lý tin|Hủy tin|giá đăng|Đang hủy…|Đã hủy tin ✓`,
    `Mua bản khắc|Bạn trả phí thợ đào|Nhà tài trợ trả thợ đào bằng BTC|Nhà tài trợ chưa sẵn sàng|Trả phí mạng bằng|Thợ đào nhận BTC ở cả hai chế độ.|shhhhh không bao giờ bị đổi ngầm và ví không chuyển sang BTC khi chưa hỏi.|Mức phí Bitcoin|Đang kiểm tra tin…|Xem lại giao dịch mua|Một bước trước khi mua|Chuẩn bị ví|Chuẩn bị mua|một lần|Thao tác|Chia BTC thành 3 UTXO trong ví|Xác nhận và mua|Người bán nhận|Tổng BTC|Đã mua ✓`,
    `Bảo vệ ví này|Dùng ít nhất 8 ký tự. Bạn có thể hiện từng mật khẩu để kiểm tra.|Mật khẩu (8+ ký tự)|Nhập lại mật khẩu|Hiện mật khẩu|Ẩn mật khẩu|Tạo ví|Đang mã hóa…|Dùng ít nhất 8 ký tự.|Mật khẩu không khớp.`),
  th: extraPack(
    `ตลาด|ซื้อขายจารึกแบบอะตอมมิกบน Bitcoin|รีเฟรชตลาด|ขาย|รายการขาย|การชำระ|BTC แบบอะตอมมิก|ค่าธรรมเนียมเครือข่าย|ผู้ขายเก็บทรัพย์สินไว้|การขายจ่ายผู้ขายและย้ายจารึกในธุรกรรม Bitcoin เดียว นักขุดได้รับ BTC เสมอ|ผู้สนับสนุน shhhhh ออนไลน์|ผู้สนับสนุน shhhhh ยังไม่พร้อม|สำรวจ|รายการของฉัน|กำลังโหลดตลาด…|ไม่มีรายการที่ใช้งาน|ตลาดว่าง|เลือก ขาย เพื่อลงรายการจารึก|รายการที่ลงนามรายการแรกจะแสดงที่นี่|ของคุณ|การขายแบบอะตอมมิก|ซื้อ`,
    `ขายจารึก|เลือกหนึ่งรายการ รายการจะอยู่ในกระเป๋าจนกว่าการซื้อแบบอะตอมมิกจะยืนยัน|ไม่มีจารึกที่ใช้ได้|ไม่แสดงรายการที่ลงขาย ซ่อน หรือยังไม่ยืนยัน|ตั้งราคา|ราคา|ตรวจสอบรายการ|ลงนามและลงขาย|คุณได้รับ|ค่าลงรายการ|ฟรี|กำลังเผยแพร่…|ลงรายการแล้ว ✓|จัดการรายการ|ยกเลิกรายการ|ราคาที่ลง|กำลังยกเลิก…|ยกเลิกรายการแล้ว ✓`,
    `ซื้อจารึก|คุณจ่ายค่าธรรมเนียมนักขุด|ผู้สนับสนุนจ่ายนักขุดเป็น BTC|ผู้สนับสนุนยังไม่พร้อม|จ่ายค่าธรรมเนียมเครือข่ายด้วย|นักขุดได้รับ BTC ในทั้งสองโหมด|shhhhh จะไม่ถูกแปลงอย่างเงียบ ๆ และกระเป๋าจะไม่เปลี่ยนเป็น BTC โดยไม่ถาม|อัตราค่าธรรมเนียม Bitcoin|กำลังตรวจสอบรายการ…|ตรวจสอบการซื้อ|หนึ่งขั้นตอนก่อนซื้อ|เตรียมกระเป๋าของฉัน|เตรียมซื้อ|ครั้งเดียว|การทำงาน|แบ่ง BTC เป็น UTXO ในกระเป๋า 3 รายการ|ยืนยันและซื้อ|ผู้ขายได้รับ|BTC รวม|ซื้อแล้ว ✓`,
    `ปกป้องกระเป๋านี้|ใช้อย่างน้อย 8 ตัวอักษร คุณสามารถแสดงแต่ละรหัสผ่านเพื่อตรวจสอบได้|รหัสผ่าน (8+ ตัวอักษร)|ป้อนรหัสผ่านอีกครั้ง|แสดงรหัสผ่าน|ซ่อนรหัสผ่าน|สร้างกระเป๋า|กำลังเข้ารหัส…|ใช้อย่างน้อย 8 ตัวอักษร|รหัสผ่านไม่ตรงกัน`),
  ms: extraPack(
    `Pasaran|Dagangan inskripsi atomik di Bitcoin|Muat semula pasaran|Jual|Penyenaraian|Penyelesaian|BTC atomik|Yuran rangkaian|Penjual kekal memegang aset|Jualan membayar penjual dan memindahkan inskripsi dalam satu transaksi Bitcoin. Pelombong sentiasa menerima BTC.|Penaja shhhhh dalam talian|Penaja shhhhh belum tersedia|Teroka|Penyenaraian saya|Memuatkan pasaran…|Tiada penyenaraian aktif|Pasaran kosong|Pilih Jual untuk menyenaraikan inskripsi.|Penyenaraian bertandatangan pertama akan muncul di sini.|Milik anda|Jualan atomik|Beli`,
    `Jual inskripsi|Pilih satu item. Ia kekal dalam dompet sehingga pembelian atomik disahkan.|Tiada inskripsi tersedia|Item tersenarai, tersembunyi dan belum disahkan tidak dipaparkan.|Tetapkan harga|Harga|Semak penyenaraian|Tandatangan dan senarai|Anda menerima|Yuran penyenaraian|Percuma|Menerbitkan…|Disenaraikan ✓|Urus penyenaraian|Batal penyenaraian|harga tersenarai|Membatalkan…|Penyenaraian dibatalkan ✓`,
    `Beli inskripsi|Anda membayar yuran pelombong|Penaja membayar pelombong dalam BTC|Penaja belum tersedia|Bayar yuran rangkaian dengan|Pelombong menerima BTC dalam kedua-dua mod.|shhhhh tidak pernah ditukar secara senyap dan dompet tidak beralih ke BTC tanpa bertanya.|Kadar yuran Bitcoin|Memeriksa penyenaraian…|Semak pembelian|Satu langkah sebelum membeli|Sediakan dompet saya|Sediakan pembelian|sekali sahaja|Tindakan|Bahagi BTC kepada 3 UTXO dompet|Sahkan dan beli|Penjual menerima|Jumlah BTC|Dibeli ✓`,
    `Lindungi dompet ini|Gunakan sekurang-kurangnya 8 aksara. Anda boleh memaparkan setiap kata laluan untuk menyemaknya.|Kata laluan (8+ aksara)|Ulang kata laluan|Tunjuk kata laluan|Sembunyi kata laluan|Cipta dompet|Menyulitkan…|Gunakan sekurang-kurangnya 8 aksara.|Kata laluan tidak sepadan.`),
  fil: extraPack(
    `Merkado|Atomikong kalakalan ng inskripsiyon sa Bitcoin|I-refresh ang merkado|Ibenta|Mga listing|Settlement|Atomikong BTC|Bayad sa network|Nasa nagbebenta ang kustodiya|Binabayaran ng bentahan ang nagbebenta at inililipat ang inskripsiyon sa iisang transaksyon ng Bitcoin. Laging BTC ang natatanggap ng mga minero.|Online ang shhhhh sponsor|Hindi pa available ang shhhhh sponsor|Tuklasin|Mga listing ko|Nilo-load ang merkado…|Walang aktibong listing|Walang laman ang merkado|Piliin ang Ibenta para mag-list ng inskripsiyon.|Lalabas dito ang unang pirmadong listing.|Iyo|Atomikong bentahan|Bumili`,
    `Magbenta ng inskripsiyon|Pumili ng isang item. Mananatili ito sa wallet hanggang makumpirma ang atomikong pagbili.|Walang available na inskripsiyon|Hindi ipinapakita ang naka-list, nakatago at hindi kumpirmadong item.|Magtakda ng presyo|Presyo|Suriin ang listing|Pirmahan at i-list|Matatanggap mo|Bayad sa listing|Libre|Inilalathala…|Naka-list ✓|Pamahalaan ang listing|Kanselahin ang listing|presyo sa listing|Kinakansela…|Kinansela ang listing ✓`,
    `Bumili ng inskripsiyon|Ikaw ang magbabayad sa minero|Sponsor ang nagbabayad sa mga minero gamit ang BTC|Hindi available ang sponsor|Bayaran ang network fee gamit ang|BTC ang natatanggap ng mga minero sa parehong mode.|Hindi palihim na kino-convert ang shhhhh at hindi lilipat sa BTC ang wallet nang hindi nagtatanong.|Rate ng bayad sa Bitcoin|Sinusuri ang listing…|Suriin ang pagbili|Isang hakbang bago bumili|Ihanda ang wallet ko|Ihanda ang pagbili|isang beses|Aksyon|Hatiin ang BTC sa 3 UTXO ng wallet|Kumpirmahin at bumili|Matatanggap ng nagbebenta|Kabuuang BTC|Nabili ✓`,
    `Protektahan ang wallet na ito|Gumamit ng hindi bababa sa 8 character. Maaari mong ipakita ang bawat password para masuri ito.|Password (8+ character)|Ulitin ang password|Ipakita ang password|Itago ang password|Gumawa ng wallet|Ini-encrypt…|Gumamit ng hindi bababa sa 8 character.|Hindi magkatugma ang mga password.`),
};
for (const [code, values] of Object.entries(EXTRA_UI_TRANSLATIONS)) {
  if (values.length !== EXTRA_UI_KEYS.length) throw new Error(`extra UI translation length mismatch for ${code}: ${values.length}/${EXTRA_UI_KEYS.length}`);
  EXTRA_UI_KEYS.forEach((key, index) => catalogs[code].set(key, values[index]));
}

const MARKET_LAYOUT_KEYS = ['Non-custodial settlement', 'Seller keeps custody · miners receive BTC', 'Market unavailable', 'Try again'];
const MARKET_LAYOUT_TRANSLATIONS = {
  'zh-CN': ['非托管结算', '卖家自行保管 · 矿工收取 BTC', '市场暂不可用', '重试'],
  'zh-TW': ['非託管結算', '賣家自行保管 · 礦工收取 BTC', '市場暫不可用', '重試'],
  ja: ['非カストディ決済', '売り手が保管 · マイナーはBTCを受取', 'マーケットを利用できません', '再試行'],
  ko: ['비수탁 결제', '판매자 직접 보관 · 채굴자는 BTC 수령', '마켓을 사용할 수 없음', '다시 시도'],
  es: ['Liquidación sin custodia', 'El vendedor conserva la custodia · los mineros reciben BTC', 'Mercado no disponible', 'Reintentar'],
  'pt-BR': ['Liquidação sem custódia', 'O vendedor mantém a custódia · mineradores recebem BTC', 'Mercado indisponível', 'Tentar novamente'],
  ru: ['Расчёт без хранения', 'Хранение у продавца · майнеры получают BTC', 'Маркет недоступен', 'Повторить'],
  fr: ['Règlement non dépositaire', 'Le vendeur garde la possession · les mineurs reçoivent du BTC', 'Marché indisponible', 'Réessayer'],
  de: ['Abwicklung ohne Verwahrung', 'Verwahrung beim Verkäufer · Miner erhalten BTC', 'Markt nicht verfügbar', 'Erneut versuchen'],
  it: ['Regolamento non custodiale', 'Il venditore mantiene la custodia · i miner ricevono BTC', 'Mercato non disponibile', 'Riprova'],
  nl: ['Afwikkeling zonder bewaring', 'Verkoper houdt beheer · miners ontvangen BTC', 'Markt niet beschikbaar', 'Opnieuw proberen'],
  pl: ['Rozliczenie bez powiernictwa', 'Kontrola u sprzedawcy · górnicy otrzymują BTC', 'Rynek niedostępny', 'Spróbuj ponownie'],
  tr: ['Gözetimsiz takas', 'Saklama satıcıda · madenciler BTC alır', 'Pazar kullanılamıyor', 'Tekrar dene'],
  id: ['Penyelesaian non-kustodian', 'Penjual memegang aset · penambang menerima BTC', 'Pasar tidak tersedia', 'Coba lagi'],
  vi: ['Thanh toán không lưu ký', 'Người bán tự giữ tài sản · thợ đào nhận BTC', 'Chợ không khả dụng', 'Thử lại'],
  th: ['การชำระแบบไม่รับฝาก', 'ผู้ขายเก็บทรัพย์สิน · นักขุดรับ BTC', 'ตลาดไม่พร้อมใช้งาน', 'ลองอีกครั้ง'],
  ms: ['Penyelesaian tanpa jagaan', 'Penjual memegang aset · pelombong menerima BTC', 'Pasaran tidak tersedia', 'Cuba lagi'],
  fil: ['Settlement na walang kustodiya', 'Nasa nagbebenta ang kustodiya · BTC ang natatanggap ng minero', 'Hindi available ang merkado', 'Subukan muli'],
};
for (const [code, values] of Object.entries(MARKET_LAYOUT_TRANSLATIONS)) MARKET_LAYOUT_KEYS.forEach((key, index) => catalogs[code].set(key, values[index]));

const MARKET_LENGTH_KEYS = [
  '4, 5 and 6-byte BRC-20 transfer market', 'UTF-8 bytes', '4-byte', '5-byte', '6-byte', 'Live listings', 'All ticker lengths',
  'No listings in this category', 'Choose another ticker length or list an inscription.', 'Demo catalog', '4, 5 and 6-byte transfer examples',
  'The inscription content is unavailable.', 'The listing asset details do not match the inscription.',
];
const lengthPack = (values) => values.split('|');
const MARKET_LENGTH_TRANSLATIONS = {
  'zh-CN': lengthPack(`4、5、6 字节 BRC-20 转账铭文市场|UTF-8 字节|4 字节|5 字节|6 字节|实时挂单|全部代号长度|当前分类暂无挂单|请选择其他代号长度，或挂出一枚铭文。|演示目录|4、5、6 字节转账铭文示例|铭文内容不可用。|挂单资产信息与链上铭文不一致。`),
  'zh-TW': lengthPack(`4、5、6 位元組 BRC-20 轉帳銘文市場|UTF-8 位元組|4 位元組|5 位元組|6 位元組|即時掛單|全部代號長度|此分類暫無掛單|請選擇其他代號長度，或掛出一枚銘文。|示範目錄|4、5、6 位元組轉帳銘文範例|銘文內容無法使用。|掛單資產資料與鏈上銘文不一致。`),
  ja: lengthPack(`4・5・6バイトBRC-20転送マーケット|UTF-8バイト|4バイト|5バイト|6バイト|実際の出品|すべてのティッカー長|この分類に出品はありません|別のティッカー長を選ぶか、インスクリプションを出品してください。|デモカタログ|4・5・6バイト転送例|インスクリプション内容を取得できません。|出品の資産情報がインスクリプションと一致しません。`),
  ko: lengthPack(`4·5·6바이트 BRC-20 전송 마켓|UTF-8 바이트|4바이트|5바이트|6바이트|실제 등록|모든 티커 길이|이 분류에 등록이 없습니다|다른 티커 길이를 선택하거나 인스크립션을 등록하세요.|데모 카탈로그|4·5·6바이트 전송 인스크립션 예시|인스크립션 내용을 불러올 수 없습니다.|등록 자산 정보가 인스크립션과 일치하지 않습니다.`),
  es: lengthPack(`Mercado de transferencias BRC-20 de 4, 5 y 6 bytes|Bytes UTF-8|4 bytes|5 bytes|6 bytes|Anuncios reales|Todas las longitudes|No hay anuncios en esta categoría|Elige otra longitud o anuncia una inscripción.|Catálogo de demostración|Ejemplos de transferencias de 4, 5 y 6 bytes|El contenido de la inscripción no está disponible.|Los datos del activo no coinciden con la inscripción.`),
  'pt-BR': lengthPack(`Mercado de transferências BRC-20 de 4, 5 e 6 bytes|Bytes UTF-8|4 bytes|5 bytes|6 bytes|Anúncios reais|Todos os tamanhos de ticker|Nenhum anúncio nesta categoria|Escolha outro tamanho ou anuncie uma inscrição.|Catálogo de demonstração|Exemplos de transferências de 4, 5 e 6 bytes|O conteúdo da inscrição não está disponível.|Os dados do ativo não correspondem à inscrição.`),
  ru: lengthPack(`Рынок переводов BRC-20 с тикерами 4, 5 и 6 байт|Байты UTF-8|4 байта|5 байт|6 байт|Реальные лоты|Все длины тикеров|В этой категории нет лотов|Выберите другую длину или выставьте инскрипцию.|Демо-каталог|Примеры переводов на 4, 5 и 6 байт|Содержимое инскрипции недоступно.|Данные актива не совпадают с инскрипцией.`),
  fr: lengthPack(`Marché des transferts BRC-20 de 4, 5 et 6 octets|Octets UTF-8|4 octets|5 octets|6 octets|Annonces réelles|Toutes les longueurs|Aucune annonce dans cette catégorie|Choisissez une autre longueur ou publiez une inscription.|Catalogue de démonstration|Exemples de transferts de 4, 5 et 6 octets|Le contenu de l’inscription est indisponible.|Les données de l’actif ne correspondent pas à l’inscription.`),
  de: lengthPack(`Markt für BRC-20-Transfers mit 4, 5 und 6 Bytes|UTF-8-Bytes|4 Bytes|5 Bytes|6 Bytes|Echte Angebote|Alle Tickerlängen|Keine Angebote in dieser Kategorie|Wähle eine andere Länge oder biete eine Inschrift an.|Demo-Katalog|Transferbeispiele mit 4, 5 und 6 Bytes|Der Inhalt der Inschrift ist nicht verfügbar.|Die Asset-Daten stimmen nicht mit der Inschrift überein.`),
  it: lengthPack(`Mercato dei trasferimenti BRC-20 da 4, 5 e 6 byte|Byte UTF-8|4 byte|5 byte|6 byte|Annunci reali|Tutte le lunghezze|Nessun annuncio in questa categoria|Scegli un’altra lunghezza o pubblica un’iscrizione.|Catalogo demo|Esempi di trasferimenti da 4, 5 e 6 byte|Il contenuto dell’iscrizione non è disponibile.|I dati dell’asset non corrispondono all’iscrizione.`),
  nl: lengthPack(`Markt voor BRC-20-overdrachten van 4, 5 en 6 bytes|UTF-8-bytes|4 bytes|5 bytes|6 bytes|Echte aanbiedingen|Alle tickerlengtes|Geen aanbiedingen in deze categorie|Kies een andere lengte of bied een inscriptie aan.|Democatalogus|Overdrachtsvoorbeelden van 4, 5 en 6 bytes|De inhoud van de inscriptie is niet beschikbaar.|De assetgegevens komen niet overeen met de inscriptie.`),
  pl: lengthPack(`Rynek transferów BRC-20 z tickerami 4, 5 i 6 bajtów|Bajty UTF-8|4 bajty|5 bajtów|6 bajtów|Aktywne oferty|Wszystkie długości|Brak ofert w tej kategorii|Wybierz inną długość lub wystaw inskrypcję.|Katalog demonstracyjny|Przykłady transferów 4, 5 i 6 bajtów|Treść inskrypcji jest niedostępna.|Dane aktywa nie pasują do inskrypcji.`),
  tr: lengthPack(`4, 5 ve 6 bayt BRC-20 aktarım pazarı|UTF-8 baytları|4 bayt|5 bayt|6 bayt|Canlı ilanlar|Tüm sembol uzunlukları|Bu kategoride ilan yok|Başka bir uzunluk seçin veya bir yazıt listeleyin.|Demo kataloğu|4, 5 ve 6 bayt aktarım örnekleri|Yazıt içeriği kullanılamıyor.|İlan varlık bilgileri yazıtla eşleşmiyor.`),
  id: lengthPack(`Pasar transfer BRC-20 4, 5, dan 6 byte|Byte UTF-8|4 byte|5 byte|6 byte|Daftar nyata|Semua panjang ticker|Tidak ada daftar di kategori ini|Pilih panjang lain atau daftarkan inskripsi.|Katalog demo|Contoh transfer 4, 5, dan 6 byte|Konten inskripsi tidak tersedia.|Detail aset daftar tidak cocok dengan inskripsi.`),
  vi: lengthPack(`Chợ chuyển BRC-20 mã 4, 5 và 6 byte|Byte UTF-8|4 byte|5 byte|6 byte|Tin đăng thật|Mọi độ dài mã|Không có tin trong mục này|Chọn độ dài khác hoặc đăng một bản khắc.|Danh mục demo|Ví dụ chuyển mã 4, 5 và 6 byte|Không thể tải nội dung bản khắc.|Thông tin tài sản không khớp với bản khắc.`),
  th: lengthPack(`ตลาดโอน BRC-20 ขนาด 4, 5 และ 6 ไบต์|ไบต์ UTF-8|4 ไบต์|5 ไบต์|6 ไบต์|รายการจริง|ทุกความยาวสัญลักษณ์|ไม่มีรายการในหมวดนี้|เลือกความยาวอื่นหรือลงรายการจารึก|แค็ตตาล็อกสาธิต|ตัวอย่างการโอนขนาด 4, 5 และ 6 ไบต์|ไม่สามารถใช้เนื้อหาจารึกได้|ข้อมูลสินทรัพย์ไม่ตรงกับจารึก`),
  ms: lengthPack(`Pasaran pindahan BRC-20 4, 5 dan 6 bait|Bait UTF-8|4 bait|5 bait|6 bait|Penyenaraian sebenar|Semua panjang ticker|Tiada penyenaraian dalam kategori ini|Pilih panjang lain atau senaraikan inskripsi.|Katalog demo|Contoh pindahan 4, 5 dan 6 bait|Kandungan inskripsi tidak tersedia.|Butiran aset tidak sepadan dengan inskripsi.`),
  fil: lengthPack(`Pamilihan ng BRC-20 transfer na 4, 5 at 6 byte|Mga UTF-8 byte|4 byte|5 byte|6 byte|Mga tunay na listing|Lahat ng haba ng ticker|Walang listing sa kategoryang ito|Pumili ng ibang haba o maglista ng inskripsiyon.|Katalogo ng demo|Mga halimbawa ng 4, 5 at 6 byte na transfer|Hindi available ang nilalaman ng inskripsiyon.|Hindi tugma ang detalye ng asset sa inskripsiyon.`),
};
for (const [code, values] of Object.entries(MARKET_LENGTH_TRANSLATIONS)) {
  if (values.length !== MARKET_LENGTH_KEYS.length) throw new Error(`market length translation mismatch for ${code}: ${values.length}/${MARKET_LENGTH_KEYS.length}`);
  MARKET_LENGTH_KEYS.forEach((key, index) => catalogs[code].set(key, values[index]));
}

const MARKET_BROWSER_KEYS = [
  'BTC fees', 'Market server pending', 'Demo mode is available until deployment.', 'Live markets', 'Verified BRC-20 transfer listings',
  'Demo markets', 'Layout preview · not on-chain', 'Token / listings', 'Floor price', 'How trading works',
  'Verify · choose fee · review · atomic settlement', 'Back to markets', 'Lowest total', 'Active signed offers', 'Demo orders',
  'Listed amount', '24h volume', 'No verified trade history yet', 'Price: low to high', 'Price: high to low', 'Unit price', 'Total price', 'Manage',
];
const browserPack = (values) => values.split('|');
const MARKET_BROWSER_TRANSLATIONS = {
  'zh-CN': browserPack(`BTC 手续费|市场服务器待部署|部署完成前可使用演示模式。|实时市场|已验证的 BRC-20 转账挂单|演示市场|排版预览 · 未上链|代币 / 挂单|地板价|交易流程|核验 · 选择手续费 · 复核 · 原子结算|返回市场|最低总价|有效签名挂单|演示订单|挂单数量|24 小时成交量|暂无可验证的成交历史|价格：从低到高|价格：从高到低|单价|总价|管理`),
  'zh-TW': browserPack(`BTC 手續費|市場伺服器待部署|部署完成前可使用示範模式。|即時市場|已驗證的 BRC-20 轉帳掛單|示範市場|版面預覽 · 未上鏈|代幣 / 掛單|地板價|交易流程|核驗 · 選擇手續費 · 複核 · 原子結算|返回市場|最低總價|有效簽名掛單|示範訂單|掛單數量|24 小時成交量|暫無可驗證的成交記錄|價格：由低至高|價格：由高至低|單價|總價|管理`),
  ja: browserPack(`BTC手数料|マーケットサーバーは未導入です|導入まではデモモードを利用できます。|実際のマーケット|検証済みBRC-20転送出品|デモマーケット|レイアウト確認 · オンチェーンではありません|トークン / 出品|フロア価格|取引の流れ|検証 · 手数料選択 · 確認 · アトミック決済|マーケットへ戻る|最低合計価格|有効な署名済み出品|デモ注文|出品数量|24時間出来高|検証可能な取引履歴はまだありません|価格：安い順|価格：高い順|単価|合計価格|管理`),
  ko: browserPack(`BTC 수수료|마켓 서버 배포 대기 중|배포 전까지 데모 모드를 사용할 수 있습니다.|실제 마켓|검증된 BRC-20 전송 등록|데모 마켓|레이아웃 미리보기 · 온체인 아님|토큰 / 등록|최저가|거래 절차|검증 · 수수료 선택 · 검토 · 아토믹 결제|마켓으로 돌아가기|최저 총액|활성 서명 등록|데모 주문|등록 수량|24시간 거래량|검증된 거래 내역이 아직 없습니다|가격: 낮은 순|가격: 높은 순|단가|총액|관리`),
  es: browserPack(`Comisiones BTC|Servidor del mercado pendiente|El modo de demostración está disponible hasta el despliegue.|Mercados activos|Anuncios de transferencia BRC-20 verificados|Mercados de demostración|Vista previa · fuera de cadena|Token / anuncios|Precio mínimo|Cómo funciona la compra|Verificar · elegir comisión · revisar · liquidación atómica|Volver a mercados|Total mínimo|Ofertas firmadas activas|Órdenes de demostración|Cantidad anunciada|Volumen 24 h|Aún no hay historial de operaciones verificado|Precio: menor a mayor|Precio: mayor a menor|Precio unitario|Precio total|Gestionar`),
  'pt-BR': browserPack(`Taxas em BTC|Servidor do mercado pendente|O modo de demonstração fica disponível até a implantação.|Mercados ativos|Anúncios de transferência BRC-20 verificados|Mercados de demonstração|Prévia do layout · fora da blockchain|Token / anúncios|Preço mínimo|Como funciona a negociação|Verificar · escolher taxa · revisar · liquidação atômica|Voltar aos mercados|Total mínimo|Ofertas assinadas ativas|Ordens de demonstração|Quantidade anunciada|Volume em 24 h|Ainda não há histórico verificado de negociações|Preço: menor para maior|Preço: maior para menor|Preço unitário|Preço total|Gerenciar`),
  ru: browserPack(`Комиссии BTC|Сервер маркета ожидает развёртывания|До развёртывания доступен деморежим.|Активные рынки|Проверенные лоты переводов BRC-20|Демо-рынки|Предпросмотр · не в блокчейне|Токен / лоты|Минимальная цена|Как проходит сделка|Проверка · выбор комиссии · подтверждение · атомарный расчёт|Назад к рынкам|Минимальная сумма|Активные подписанные офферы|Демо-ордера|Объём в лотах|Объём за 24 ч|Проверенной истории сделок пока нет|Цена: по возрастанию|Цена: по убыванию|Цена за единицу|Общая цена|Управлять`),
  fr: browserPack(`Frais en BTC|Serveur du marché en attente|Le mode démo reste disponible avant le déploiement.|Marchés actifs|Annonces de transfert BRC-20 vérifiées|Marchés de démonstration|Aperçu de la mise en page · hors chaîne|Jeton / annonces|Prix plancher|Fonctionnement d’une transaction|Vérifier · choisir les frais · contrôler · règlement atomique|Retour aux marchés|Total minimal|Offres signées actives|Ordres de démonstration|Quantité proposée|Volume sur 24 h|Aucun historique de transactions vérifié|Prix : croissant|Prix : décroissant|Prix unitaire|Prix total|Gérer`),
  de: browserPack(`BTC-Gebühren|Marktserver noch nicht bereitgestellt|Bis zur Bereitstellung ist der Demomodus verfügbar.|Aktive Märkte|Verifizierte BRC-20-Transferangebote|Demo-Märkte|Layoutvorschau · nicht auf der Blockchain|Token / Angebote|Mindestpreis|So funktioniert der Handel|Prüfen · Gebühr wählen · bestätigen · atomar abwickeln|Zurück zu den Märkten|Niedrigste Gesamtsumme|Aktive signierte Angebote|Demo-Aufträge|Angebotene Menge|24-Stunden-Volumen|Noch keine verifizierte Handelshistorie|Preis: aufsteigend|Preis: absteigend|Stückpreis|Gesamtpreis|Verwalten`),
  it: browserPack(`Commissioni BTC|Server del mercato in attesa|La modalità demo è disponibile fino alla distribuzione.|Mercati attivi|Annunci di trasferimento BRC-20 verificati|Mercati demo|Anteprima layout · non on-chain|Token / annunci|Prezzo minimo|Come funziona lo scambio|Verifica · scegli commissione · controlla · regolamento atomico|Torna ai mercati|Totale minimo|Offerte firmate attive|Ordini demo|Quantità in vendita|Volume 24 ore|Nessuna cronologia verificata per ora|Prezzo: crescente|Prezzo: decrescente|Prezzo unitario|Prezzo totale|Gestisci`),
  nl: browserPack(`BTC-kosten|Marktserver nog niet uitgerold|Tot de uitrol is de demomodus beschikbaar.|Actieve markten|Geverifieerde BRC-20-overdrachtsaanbiedingen|Demomarkten|Voorbeeldweergave · niet on-chain|Token / aanbiedingen|Bodemprijs|Zo werkt handelen|Controleren · kosten kiezen · beoordelen · atomair afwikkelen|Terug naar markten|Laagste totaal|Actieve ondertekende aanbiedingen|Demo-orders|Aangeboden hoeveelheid|24-uursvolume|Nog geen geverifieerde handelsgeschiedenis|Prijs: laag naar hoog|Prijs: hoog naar laag|Eenheidsprijs|Totaalprijs|Beheren`),
  pl: browserPack(`Opłaty BTC|Serwer rynku oczekuje na wdrożenie|Do czasu wdrożenia dostępny jest tryb demonstracyjny.|Aktywne rynki|Zweryfikowane oferty transferu BRC-20|Rynki demonstracyjne|Podgląd układu · poza łańcuchem|Token / oferty|Cena minimalna|Jak działa handel|Weryfikacja · wybór opłaty · sprawdzenie · rozliczenie atomowe|Wróć do rynków|Najniższa suma|Aktywne podpisane oferty|Zlecenia demonstracyjne|Oferowana ilość|Wolumen 24 h|Brak zweryfikowanej historii transakcji|Cena: rosnąco|Cena: malejąco|Cena jednostkowa|Cena całkowita|Zarządzaj`),
  tr: browserPack(`BTC ücretleri|Pazar sunucusu dağıtım bekliyor|Dağıtıma kadar demo modu kullanılabilir.|Canlı pazarlar|Doğrulanmış BRC-20 aktarım ilanları|Demo pazarlar|Düzen önizlemesi · zincir üzerinde değil|Token / ilanlar|Taban fiyat|İşlem nasıl çalışır|Doğrula · ücret seç · incele · atomik takas|Pazarlara dön|En düşük toplam|Aktif imzalı teklifler|Demo emirler|Listelenen miktar|24 saatlik hacim|Henüz doğrulanmış işlem geçmişi yok|Fiyat: düşükten yükseğe|Fiyat: yüksekten düşüğe|Birim fiyat|Toplam fiyat|Yönet`),
  id: browserPack(`Biaya BTC|Server pasar menunggu penerapan|Mode demo tersedia hingga penerapan selesai.|Pasar aktif|Daftar transfer BRC-20 terverifikasi|Pasar demo|Pratinjau tata letak · tidak on-chain|Token / daftar|Harga dasar|Cara kerja perdagangan|Verifikasi · pilih biaya · tinjau · penyelesaian atomik|Kembali ke pasar|Total terendah|Penawaran bertanda tangan aktif|Pesanan demo|Jumlah terdaftar|Volume 24 jam|Belum ada riwayat perdagangan terverifikasi|Harga: rendah ke tinggi|Harga: tinggi ke rendah|Harga satuan|Harga total|Kelola`),
  vi: browserPack(`Phí BTC|Máy chủ chợ đang chờ triển khai|Có thể dùng chế độ demo cho đến khi triển khai.|Chợ đang hoạt động|Tin chuyển BRC-20 đã xác minh|Chợ demo|Xem trước bố cục · không ở trên chuỗi|Token / tin đăng|Giá sàn|Cách giao dịch hoạt động|Xác minh · chọn phí · xem lại · thanh toán nguyên tử|Quay lại chợ|Tổng thấp nhất|Đề nghị đã ký đang hoạt động|Lệnh demo|Số lượng đăng bán|Khối lượng 24 giờ|Chưa có lịch sử giao dịch đã xác minh|Giá: thấp đến cao|Giá: cao đến thấp|Đơn giá|Tổng giá|Quản lý`),
  th: browserPack(`ค่าธรรมเนียม BTC|เซิร์ฟเวอร์ตลาดรอการติดตั้ง|ใช้โหมดสาธิตได้จนกว่าจะติดตั้งเสร็จ|ตลาดที่ใช้งานอยู่|รายการโอน BRC-20 ที่ตรวจสอบแล้ว|ตลาดสาธิต|ดูตัวอย่างรูปแบบ · ไม่ได้อยู่บนเชน|โทเค็น / รายการ|ราคาพื้น|วิธีการซื้อขาย|ตรวจสอบ · เลือกค่าธรรมเนียม · ทบทวน · ชำระแบบอะตอมมิก|กลับไปยังตลาด|ยอดรวมต่ำสุด|ข้อเสนอที่ลงนามและใช้งานอยู่|คำสั่งสาธิต|จำนวนที่ลงรายการ|ปริมาณ 24 ชั่วโมง|ยังไม่มีประวัติการซื้อขายที่ตรวจสอบแล้ว|ราคา: ต่ำไปสูง|ราคา: สูงไปต่ำ|ราคาต่อหน่วย|ราคารวม|จัดการ`),
  ms: browserPack(`Yuran BTC|Pelayan pasaran menunggu pelaksanaan|Mod demo tersedia sehingga pelaksanaan selesai.|Pasaran aktif|Penyenaraian pindahan BRC-20 yang disahkan|Pasaran demo|Pratonton susun atur · bukan dalam rantaian|Token / penyenaraian|Harga lantai|Cara perdagangan berfungsi|Sahkan · pilih yuran · semak · penyelesaian atomik|Kembali ke pasaran|Jumlah terendah|Tawaran bertandatangan aktif|Pesanan demo|Amaun disenaraikan|Volum 24 jam|Belum ada sejarah dagangan yang disahkan|Harga: rendah ke tinggi|Harga: tinggi ke rendah|Harga seunit|Harga keseluruhan|Urus`),
  fil: browserPack(`Mga bayad sa BTC|Naghihintay ng deployment ang market server|Available ang demo mode hanggang sa deployment.|Mga aktibong market|Mga beripikadong BRC-20 transfer listing|Mga demo market|Preview ng ayos · wala sa chain|Token / mga listing|Pinakamababang presyo|Paano gumagana ang trading|I-verify · pumili ng bayad · suriin · atomikong settlement|Bumalik sa mga market|Pinakamababang kabuuan|Mga aktibong pirmadong alok|Mga demo order|Nakalistang halaga|24-oras na volume|Wala pang beripikadong kasaysayan ng trade|Presyo: mababa pataas|Presyo: mataas pababa|Presyo bawat unit|Kabuuang presyo|Pamahalaan`),
};
for (const [code, values] of Object.entries(MARKET_BROWSER_TRANSLATIONS)) {
  if (values.length !== MARKET_BROWSER_KEYS.length) throw new Error(`market browser translation mismatch for ${code}: ${values.length}/${MARKET_BROWSER_KEYS.length}`);
  MARKET_BROWSER_KEYS.forEach((key, index) => catalogs[code].set(key, values[index]));
}

const DEMO_MARKET_KEYS = [
  'No live listings yet', 'Use the demo listings below to preview the full buying flow.', 'Demo listings', 'Preview the layout and buying steps',
  'Not on-chain', 'These examples cannot be purchased and never request a signature.', 'Demo', 'Example price', 'Preview flow',
  'How a market purchase works', 'Verify', 'The wallet checks the signed offer, Bitcoin output and inscription.', 'Choose fee',
  'Pay the miner fee with BTC, or shhhhh when a Sponsor is online.', 'Review', 'Confirm the item price, seller payment and network fee separately.',
  'Atomic settlement', 'One Bitcoin transaction pays the seller and delivers the inscription.',
  'Demo only — this item is not on-chain and cannot be purchased.', 'Got it',
];
const demoPack = (values) => values.split('|');
const DEMO_MARKET_TRANSLATIONS = {
  'zh-CN': demoPack(`暂无真实挂单|使用下方演示挂单预览完整购买流程。|演示挂单|预览排版和购买步骤|未上链|这些示例无法购买，也绝不会请求签名。|演示|示例价格|预览流程|市场购买如何运作|核验|钱包会核验已签名挂单、比特币输出和铭文。|选择手续费|使用 BTC 支付矿工费；赞助节点上线后也可使用 shhhhh。|复核|分别确认铭文价格、卖家收款和网络费。|原子结算|一笔比特币交易同时付款给卖家并交付铭文。|仅供演示——此铭文未上链，无法购买。|知道了`),
  'zh-TW': demoPack(`暫無真實掛單|使用下方示範掛單預覽完整購買流程。|示範掛單|預覽版面與購買步驟|未上鏈|這些範例無法購買，也絕不會要求簽名。|示範|範例價格|預覽流程|市場購買如何運作|核驗|錢包會核驗已簽名掛單、比特幣輸出與銘文。|選擇手續費|使用 BTC 支付礦工費；贊助節點上線後也可使用 shhhhh。|複核|分別確認銘文價格、賣家收款與網路費。|原子結算|一筆比特幣交易同時付款給賣家並交付銘文。|僅供示範——此銘文未上鏈，無法購買。|知道了`),
  ja: demoPack(`実際の出品はまだありません|下のデモ出品で購入フロー全体を確認できます。|デモ出品|レイアウトと購入手順を確認|オンチェーンではありません|これらの例は購入できず、署名を求めることもありません。|デモ|参考価格|フローを確認|マーケット購入の流れ|検証|ウォレットが署名済み出品、Bitcoin出力、インスクリプションを検証します。|手数料を選択|マイナー手数料はBTCで支払い、スポンサー稼働時はshhhhhも選べます。|確認|商品価格、売り手への支払い、ネットワーク手数料を個別に確認します。|アトミック決済|1つのBitcoin取引で売り手に支払い、インスクリプションを受け取ります。|デモ専用 — この商品はオンチェーンではなく購入できません。|了解`),
  ko: demoPack(`실제 등록이 아직 없습니다|아래 데모 등록으로 전체 구매 흐름을 미리 확인하세요.|데모 등록|레이아웃과 구매 단계 미리보기|온체인 아님|이 예시는 구매할 수 없으며 서명을 요청하지 않습니다.|데모|예시 가격|흐름 미리보기|마켓 구매 절차|검증|지갑이 서명된 등록, 비트코인 출력, 인스크립션을 확인합니다.|수수료 선택|채굴 수수료는 BTC로 내며 스폰서가 온라인이면 shhhhh도 선택할 수 있습니다.|검토|아이템 가격, 판매자 지급액, 네트워크 수수료를 각각 확인합니다.|아토믹 결제|한 번의 비트코인 거래로 판매자에게 지급하고 인스크립션을 받습니다.|데모 전용 — 이 아이템은 온체인이 아니며 구매할 수 없습니다.|확인`),
  es: demoPack(`Aún no hay anuncios reales|Usa los anuncios de demostración para ver todo el proceso de compra.|Anuncios de demostración|Vista previa del diseño y los pasos de compra|No está en cadena|Estos ejemplos no se pueden comprar y nunca solicitan una firma.|Demostración|Precio de ejemplo|Ver proceso|Cómo funciona una compra|Verificar|La cartera verifica el anuncio firmado, la salida de Bitcoin y la inscripción.|Elegir comisión|Paga la comisión minera con BTC, o con shhhhh cuando haya un patrocinador activo.|Revisar|Confirma por separado el precio, el pago al vendedor y la comisión de red.|Liquidación atómica|Una transacción de Bitcoin paga al vendedor y entrega la inscripción.|Solo demostración — este artículo no está en cadena y no se puede comprar.|Entendido`),
  'pt-BR': demoPack(`Ainda não há anúncios reais|Use os anúncios de demonstração abaixo para ver todo o fluxo de compra.|Anúncios de demonstração|Visualize o layout e as etapas de compra|Fora da blockchain|Estes exemplos não podem ser comprados e nunca pedem assinatura.|Demonstração|Preço de exemplo|Ver fluxo|Como funciona uma compra|Verificar|A carteira verifica o anúncio assinado, a saída Bitcoin e a inscrição.|Escolher taxa|Pague a taxa do minerador com BTC ou shhhhh quando houver um patrocinador ativo.|Revisar|Confirme separadamente o preço, o pagamento ao vendedor e a taxa de rede.|Liquidação atômica|Uma transação Bitcoin paga o vendedor e entrega a inscrição.|Somente demonstração — este item não está na blockchain e não pode ser comprado.|Entendi`),
  ru: demoPack(`Реальных лотов пока нет|Используйте демо-лоты ниже, чтобы просмотреть весь процесс покупки.|Демо-лоты|Просмотр интерфейса и шагов покупки|Не в блокчейне|Эти примеры нельзя купить, и они никогда не запрашивают подпись.|Демо|Пример цены|Посмотреть процесс|Как работает покупка|Проверка|Кошелёк проверяет подписанный лот, выход Bitcoin и инскрипцию.|Выбор комиссии|Оплатите комиссию майнеру в BTC или shhhhh, когда спонсор работает.|Проверить|Отдельно подтвердите цену, платёж продавцу и комиссию сети.|Атомарный расчёт|Одна транзакция Bitcoin платит продавцу и доставляет инскрипцию.|Только демо — объект не находится в блокчейне и недоступен для покупки.|Понятно`),
  fr: demoPack(`Aucune annonce réelle pour le moment|Utilisez les annonces de démonstration pour prévisualiser tout le parcours d’achat.|Annonces de démonstration|Aperçu de la mise en page et des étapes d’achat|Hors chaîne|Ces exemples ne peuvent pas être achetés et ne demandent jamais de signature.|Démo|Prix indicatif|Voir le parcours|Comment fonctionne un achat|Vérifier|Le portefeuille vérifie l’annonce signée, la sortie Bitcoin et l’inscription.|Choisir les frais|Payez les frais mineur en BTC, ou en shhhhh lorsqu’un sponsor est en ligne.|Vérifier|Confirmez séparément le prix, le paiement au vendeur et les frais réseau.|Règlement atomique|Une transaction Bitcoin paie le vendeur et livre l’inscription.|Démo uniquement — cet objet est hors chaîne et ne peut pas être acheté.|Compris`),
  de: demoPack(`Noch keine echten Angebote|Mit den Demo-Angeboten unten kannst du den gesamten Kaufablauf ansehen.|Demo-Angebote|Layout und Kaufschritte ansehen|Nicht auf der Blockchain|Diese Beispiele können nicht gekauft werden und verlangen nie eine Signatur.|Demo|Beispielpreis|Ablauf ansehen|So funktioniert ein Marktkauf|Prüfen|Die Wallet prüft das signierte Angebot, den Bitcoin-Output und die Inschrift.|Gebühr wählen|Zahle die Minergebühr mit BTC oder mit shhhhh, wenn ein Sponsor online ist.|Prüfen|Bestätige Artikelpreis, Verkäuferzahlung und Netzwerkgebühr getrennt.|Atomare Abwicklung|Eine Bitcoin-Transaktion bezahlt den Verkäufer und liefert die Inschrift.|Nur Demo — dieser Artikel ist nicht auf der Blockchain und kann nicht gekauft werden.|Verstanden`),
  it: demoPack(`Nessun annuncio reale per ora|Usa gli annunci dimostrativi per vedere l’intero flusso di acquisto.|Annunci dimostrativi|Anteprima del layout e dei passaggi di acquisto|Non on-chain|Questi esempi non possono essere acquistati e non chiedono mai una firma.|Demo|Prezzo di esempio|Vedi flusso|Come funziona un acquisto|Verifica|Il wallet verifica l’annuncio firmato, l’output Bitcoin e l’iscrizione.|Scegli commissione|Paga la commissione miner in BTC o shhhhh quando uno sponsor è online.|Rivedi|Conferma separatamente prezzo, pagamento al venditore e commissione di rete.|Regolamento atomico|Una transazione Bitcoin paga il venditore e consegna l’iscrizione.|Solo demo — questo oggetto non è on-chain e non può essere acquistato.|Ho capito`),
  nl: demoPack(`Nog geen echte aanbiedingen|Gebruik de demo-aanbiedingen om het volledige aankoopproces te bekijken.|Demo-aanbiedingen|Voorbeeld van indeling en aankoopstappen|Niet on-chain|Deze voorbeelden zijn niet te koop en vragen nooit om een handtekening.|Demo|Voorbeeldprijs|Proces bekijken|Zo werkt een marktaankoop|Controleren|De wallet controleert de ondertekende aanbieding, Bitcoin-output en inscriptie.|Kosten kiezen|Betaal de minerfee met BTC, of met shhhhh wanneer een sponsor online is.|Controleren|Bevestig prijs, betaling aan verkoper en netwerkkosten afzonderlijk.|Atomaire afwikkeling|Eén Bitcoin-transactie betaalt de verkoper en levert de inscriptie.|Alleen demo — dit item staat niet on-chain en kan niet worden gekocht.|Begrepen`),
  pl: demoPack(`Brak prawdziwych ofert|Użyj ofert demonstracyjnych, aby zobaczyć cały proces zakupu.|Oferty demonstracyjne|Podgląd układu i kroków zakupu|Poza łańcuchem|Tych przykładów nie można kupić i nigdy nie proszą o podpis.|Demo|Przykładowa cena|Zobacz proces|Jak działa zakup|Weryfikacja|Portfel sprawdza podpisaną ofertę, wyjście Bitcoin i inskrypcję.|Wybierz opłatę|Zapłać opłatę górniczą w BTC lub shhhhh, gdy sponsor jest online.|Sprawdź|Potwierdź osobno cenę, płatność sprzedawcy i opłatę sieciową.|Rozliczenie atomowe|Jedna transakcja Bitcoin płaci sprzedawcy i dostarcza inskrypcję.|Tylko demo — ten element nie jest w łańcuchu i nie można go kupić.|Rozumiem`),
  tr: demoPack(`Henüz gerçek ilan yok|Tüm satın alma akışını görmek için aşağıdaki demo ilanları kullanın.|Demo ilanlar|Düzeni ve satın alma adımlarını önizle|Zincir üzerinde değil|Bu örnekler satın alınamaz ve asla imza istemez.|Demo|Örnek fiyat|Akışı önizle|Pazar satın alımı nasıl çalışır|Doğrula|Cüzdan imzalı ilanı, Bitcoin çıktısını ve yazıtı doğrular.|Ücret seç|Madenci ücretini BTC ile veya sponsor çevrimiçiyken shhhhh ile ödeyin.|İncele|Ürün fiyatını, satıcı ödemesini ve ağ ücretini ayrı ayrı onaylayın.|Atomik takas|Tek bir Bitcoin işlemi satıcıya ödeme yapar ve yazıtı teslim eder.|Yalnızca demo — bu ürün zincir üzerinde değildir ve satın alınamaz.|Anladım`),
  id: demoPack(`Belum ada daftar nyata|Gunakan daftar demo di bawah untuk melihat seluruh alur pembelian.|Daftar demo|Pratinjau tata letak dan langkah pembelian|Tidak on-chain|Contoh ini tidak dapat dibeli dan tidak pernah meminta tanda tangan.|Demo|Harga contoh|Pratinjau alur|Cara kerja pembelian pasar|Verifikasi|Dompet memeriksa daftar bertanda tangan, output Bitcoin, dan inskripsi.|Pilih biaya|Bayar biaya penambang dengan BTC, atau shhhhh saat sponsor aktif.|Tinjau|Konfirmasikan harga, pembayaran penjual, dan biaya jaringan secara terpisah.|Penyelesaian atomik|Satu transaksi Bitcoin membayar penjual dan mengirim inskripsi.|Hanya demo — item ini tidak on-chain dan tidak dapat dibeli.|Mengerti`),
  vi: demoPack(`Chưa có tin đăng thật|Dùng các tin demo bên dưới để xem toàn bộ quy trình mua.|Tin đăng demo|Xem trước bố cục và các bước mua|Không ở trên chuỗi|Các ví dụ này không thể mua và không bao giờ yêu cầu chữ ký.|Demo|Giá ví dụ|Xem quy trình|Cách mua trên chợ|Xác minh|Ví kiểm tra tin đã ký, đầu ra Bitcoin và bản khắc.|Chọn phí|Trả phí thợ đào bằng BTC hoặc shhhhh khi nhà tài trợ trực tuyến.|Xem lại|Xác nhận riêng giá, khoản trả người bán và phí mạng.|Thanh toán nguyên tử|Một giao dịch Bitcoin trả người bán và chuyển bản khắc.|Chỉ là demo — mục này không ở trên chuỗi và không thể mua.|Đã hiểu`),
  th: demoPack(`ยังไม่มีรายการจริง|ใช้รายการสาธิตด้านล่างเพื่อดูขั้นตอนการซื้อทั้งหมด|รายการสาธิต|ดูตัวอย่างรูปแบบและขั้นตอนการซื้อ|ไม่ได้อยู่บนเชน|ตัวอย่างเหล่านี้ซื้อไม่ได้และจะไม่ขอลายเซ็น|สาธิต|ราคาตัวอย่าง|ดูขั้นตอน|การซื้อในตลาดทำงานอย่างไร|ตรวจสอบ|กระเป๋าจะตรวจสอบรายการที่ลงนาม เอาต์พุต Bitcoin และจารึก|เลือกค่าธรรมเนียม|จ่ายค่าธรรมเนียมนักขุดด้วย BTC หรือ shhhhh เมื่อผู้สนับสนุนออนไลน์|ตรวจสอบ|ยืนยันราคา การจ่ายผู้ขาย และค่าธรรมเนียมเครือข่ายแยกกัน|การชำระแบบอะตอมมิก|ธุรกรรม Bitcoin เดียวจ่ายผู้ขายและส่งมอบจารึก|สำหรับสาธิตเท่านั้น — รายการนี้ไม่ได้อยู่บนเชนและซื้อไม่ได้|เข้าใจแล้ว`),
  ms: demoPack(`Belum ada penyenaraian sebenar|Gunakan penyenaraian demo di bawah untuk melihat keseluruhan aliran pembelian.|Penyenaraian demo|Pratonton susun atur dan langkah pembelian|Bukan dalam rantaian|Contoh ini tidak boleh dibeli dan tidak pernah meminta tandatangan.|Demo|Harga contoh|Pratonton aliran|Cara pembelian pasaran berfungsi|Sahkan|Dompet menyemak penyenaraian bertandatangan, output Bitcoin dan inskripsi.|Pilih yuran|Bayar yuran pelombong dengan BTC atau shhhhh apabila penaja dalam talian.|Semak|Sahkan harga, bayaran penjual dan yuran rangkaian secara berasingan.|Penyelesaian atomik|Satu transaksi Bitcoin membayar penjual dan menghantar inskripsi.|Demo sahaja — item ini bukan dalam rantaian dan tidak boleh dibeli.|Faham`),
  fil: demoPack(`Wala pang tunay na listing|Gamitin ang mga demo listing sa ibaba para makita ang buong daloy ng pagbili.|Mga demo listing|I-preview ang ayos at mga hakbang sa pagbili|Wala sa chain|Hindi mabibili ang mga halimbawang ito at hindi kailanman hihingi ng lagda.|Demo|Halimbawang presyo|I-preview ang daloy|Paano gumagana ang pagbili|I-verify|Sinusuri ng wallet ang pirmadong listing, Bitcoin output, at inskripsiyon.|Pumili ng bayad|Bayaran ang minero gamit ang BTC, o shhhhh kapag online ang sponsor.|Suriin|Hiwalay na kumpirmahin ang presyo, bayad sa nagbebenta, at network fee.|Atomikong settlement|Isang transaksyon ng Bitcoin ang nagbabayad sa nagbebenta at naghahatid ng inskripsiyon.|Demo lamang — wala sa chain ang item na ito at hindi ito mabibili.|Naintindihan`),
};
for (const [code, values] of Object.entries(DEMO_MARKET_TRANSLATIONS)) {
  if (values.length !== DEMO_MARKET_KEYS.length) throw new Error(`demo market translation length mismatch for ${code}: ${values.length}/${DEMO_MARKET_KEYS.length}`);
  DEMO_MARKET_KEYS.forEach((key, index) => catalogs[code].set(key, values[index]));
}

export function normalizeLanguage(value) {
  return LANGUAGES.some((language) => language.code === value) ? value : DEFAULT_LANGUAGE;
}

function translatePattern(value, language) {
  const explore = value.match(/^Explore \(([^)]+)\)$/);
  if (explore) return `${catalogs[language].get('Explore') || 'Explore'} (${explore[1]})`;
  const n = value.match(/^(\d[\d,]*) (bytes|mints|images|inscriptions)$/);
  if (n) {
    const unit = {
      'zh-CN': { bytes: '字节', mints: '次铸造', images: '张图片', inscriptions: '个铭文' },
      'zh-TW': { bytes: '位元組', mints: '次鑄造', images: '張圖片', inscriptions: '個銘文' },
      ja: { bytes: 'バイト', mints: '回ミント', images: '枚の画像', inscriptions: '件' },
      ko: { bytes: '바이트', mints: '회 민팅', images: '개 이미지', inscriptions: '개 인스크립션' },
      es: { bytes: 'bytes', mints: 'acuñaciones', images: 'imágenes', inscriptions: 'inscripciones' },
      'pt-BR': { bytes: 'bytes', mints: 'cunhagens', images: 'imagens', inscriptions: 'inscrições' },
      ru: { bytes: 'байт', mints: 'чеканок', images: 'изображений', inscriptions: 'инскрипций' },
      fr: { bytes: 'octets', mints: 'émissions', images: 'images', inscriptions: 'inscriptions' },
      de: { bytes: 'Bytes', mints: 'Prägungen', images: 'Bilder', inscriptions: 'Inschriften' },
      it: { bytes: 'byte', mints: 'coniazioni', images: 'immagini', inscriptions: 'iscrizioni' },
      nl: { bytes: 'bytes', mints: 'mints', images: 'afbeeldingen', inscriptions: 'inscripties' },
      pl: { bytes: 'bajtów', mints: 'wybić', images: 'obrazów', inscriptions: 'inskrypcji' },
      tr: { bytes: 'bayt', mints: 'basım', images: 'görsel', inscriptions: 'yazıt' },
      id: { bytes: 'byte', mints: 'cetakan', images: 'gambar', inscriptions: 'inskripsi' },
      vi: { bytes: 'byte', mints: 'lần đúc', images: 'hình ảnh', inscriptions: 'bản khắc' },
      th: { bytes: 'ไบต์', mints: 'ครั้ง', images: 'รูป', inscriptions: 'จารึก' },
      ms: { bytes: 'bait', mints: 'tempaan', images: 'imej', inscriptions: 'inskripsi' },
      fil: { bytes: 'byte', mints: 'mint', images: 'larawan', inscriptions: 'inskripsiyon' },
    }[language];
    return unit ? `${n[1]} ${unit[n[2]]}` : value;
  }
  const block = value.match(/^Block ([\d,]+)$/);
  if (block) return `${({ 'zh-CN': '区块', 'zh-TW': '區塊', ja: 'ブロック', ko: '블록', es: 'Bloque', 'pt-BR': 'Bloco', ru: 'Блок', fr: 'Bloc', de: 'Block', it: 'Blocco', nl: 'Blok', pl: 'Blok', tr: 'Blok', id: 'Blok', vi: 'Khối', th: 'บล็อก', ms: 'Blok', fil: 'Block' })[language] || 'Block'} ${block[1]}`;
  return value;
}

export function translate(value, language = DEFAULT_LANGUAGE) {
  if (typeof value !== 'string') return value;
  const code = normalizeLanguage(language);
  if (code === 'en') return value;
  return catalogs[code].get(value) || translatePattern(value, code);
}
