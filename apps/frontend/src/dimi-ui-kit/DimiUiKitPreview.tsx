import { useEffect, useState, type ReactNode } from 'react';
import './tokens.css';
import './kit.css';
import * as allIcons from './icons.generated';
import {
  ActionButton,
  Avatar,
  Badge,
  BrandMark,
  Button,
  ButtonGroup,
  Chip,
  Control,
  Divider,
  Header,
  Icon,
  IconButton,
  Input,
  InputField,
  ItemList,
  NavigationBar,
  OptionPicker,
  SectionHeader,
  SegmentedControl,
  TextButton,
  Toast,
  ValueList,
  type ControlType,
} from './index';
import {
  iconAdd,
  iconArrowForwardIos,
  iconAssignment,
  iconCheck,
  iconFilter,
  iconGlobe,
  iconMore,
  iconNotifications,
  iconSchedule,
  iconSearch,
} from './icons';

// The preview is the one place that shows every icon, so it imports them all.
const kitIcons = Object.values(allIcons);

const page = {
  minHeight: '100vh',
  padding: 'var(--kit-spacing-800) var(--kit-spacing-900)',
  background: 'var(--kit-background-secondary)',
  color: 'var(--kit-core-glyph-primary)',
  fontFamily: 'var(--kit-family)',
};
const row = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  gap: 'var(--kit-spacing-400)',
};
const card = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--kit-spacing-400)',
  padding: 'var(--kit-spacing-550)',
  borderRadius: 'var(--kit-radius-m)',
  background: 'var(--kit-background-primary)',
  boxShadow: 'inset 0 0 0 1px var(--kit-core-outline)',
};
const mobile = {
  width: 360,
  background: 'var(--kit-background-primary)',
  borderRadius: 'var(--kit-radius-m)',
  boxShadow: 'inset 0 0 0 1px var(--kit-core-outline)',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--kit-spacing-400)',
        marginBottom: 'var(--kit-spacing-850)',
      }}
    >
      <h2 className="kit-text-headline-strong" style={{ margin: 0 }}>
        {title}
      </h2>
      <div style={card}>{children}</div>
    </section>
  );
}

/** Dev-only page (/dimi-ui-kit) showing every DIMI UI KIT token and component. */
export default function DimiUiKitPreview() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scale, setScale] = useState<'100' | '135' | '150' | '200'>('100');
  const [controls, setControls] = useState<Record<ControlType, boolean>>({
    toggle: true,
    checkfill: true,
    radio: true,
    heart: true,
    star: false,
    check: true,
  });
  const [chips, setChips] = useState<Record<string, boolean>>({
    outlined: true,
    grayscale: false,
    accent: true,
    solid: false,
  });
  const [segment, setSegment] = useState('a');
  const [option, setOption] = useState<string | null>('a');
  const [text, setText] = useState('디미고');
  const [query, setQuery] = useState('');

  // Pin the page theme to the switch (tokens.css follows the OS until data-theme is set).
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = theme;
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, [theme]);

  return (
    <div data-text-scale={scale === '100' ? undefined : scale} style={page}>
      <div
        style={{
          ...row,
          justifyContent: 'space-between',
          marginBottom: 'var(--kit-spacing-800)',
        }}
      >
        <div style={row}>
          <BrandMark set="Logo/COUNCIL" size={40} label="디미고 학생회" />
          <h1 className="kit-text-title-strong" style={{ margin: 0 }}>
            DIMI UI KIT
          </h1>
        </div>
        <div style={{ ...row, width: 560, flexWrap: 'nowrap' }}>
          <SegmentedControl
            label="테마"
            items={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={theme}
            onChange={setTheme}
          />
          <SegmentedControl
            label="글자 크기"
            items={[
              { value: '100', label: '100%' },
              { value: '135', label: '135%' },
              { value: '150', label: '150%' },
              { value: '200', label: '200%' },
            ]}
            value={scale}
            onChange={setScale}
          />
        </div>
      </div>

      <Section title="Text styles">
        {[
          'display',
          'title',
          'headline',
          'body',
          'callout',
          'footnote',
          'caption',
        ].map((t) => (
          <div key={t} style={row}>
            {['weak', 'regular', 'strong'].map((w) => (
              <span key={w} className={`kit-text-${t}-${w}`}>
                {t}/{w} 디미고
              </span>
            ))}
          </div>
        ))}
        <p className="kit-text-paragraph-large" style={{ margin: 0 }}>
          Paragraph/Large — 학생회가 모은 건의를 안건으로 올리고, 진행 과정을
          모두에게 공개해요.
        </p>
        <p className="kit-text-paragraph-small" style={{ margin: 0 }}>
          Paragraph/Small — 학생회가 모은 건의를 안건으로 올리고, 진행 과정을
          모두에게 공개해요.
        </p>
      </Section>

      <Section title="Button">
        {(['primary', 'secondary'] as const).map((variant) =>
          (['grayscale', 'accent', 'negative'] as const).map((t) => (
            <div key={variant + t} style={row}>
              {(['large', 'medium', 'small'] as const).map((s) => (
                <Button
                  key={s}
                  size={s}
                  theme={t}
                  variant={variant}
                  leadingIcon={iconAdd}
                >
                  버튼
                </Button>
              ))}
              <Button theme={t} variant={variant} disabled>
                Disabled
              </Button>
            </div>
          )),
        )}
      </Section>

      <Section title="TextButton · IconButton">
        {(['grayscale', 'accent', 'negative'] as const).map((t) => (
          <div key={t} style={row}>
            {(['large', 'medium', 'small'] as const).map((s) => (
              <TextButton key={s} size={s} theme={t} leadingIcon={iconAdd}>
                이력 추가
              </TextButton>
            ))}
            <TextButton theme={t} weight="regular">
              Regular
            </TextButton>
            <TextButton theme={t} disabled>
              Disabled
            </TextButton>
          </div>
        ))}
        {(['large', 'medium'] as const).map((s) => (
          <div key={s} style={row}>
            {(
              [
                'outline',
                'grayscale',
                'accent',
                'solid',
                'badged',
                'badgedText',
              ] as const
            ).map((t) => (
              <IconButton
                key={t}
                size={s}
                theme={t}
                icon={iconNotifications}
                label={t}
                count={3}
              />
            ))}
            <IconButton
              size={s}
              theme="outline"
              icon={iconNotifications}
              label="disabled"
              disabled
            />
          </div>
        ))}
      </Section>

      <Section title="Badge · Chip">
        {(['large', 'small'] as const).map((s) => (
          <div key={s} style={row}>
            {(['grayscale', 'accent', 'negative', 'solid'] as const).map(
              (t) => (
                <Badge key={t} size={s} theme={t} leadingIcon={iconGlobe}>
                  전체 공개
                </Badge>
              ),
            )}
          </div>
        ))}
        <div style={row}>
          {(['outlined', 'grayscale', 'accent', 'solid'] as const).map((t) => (
            <Chip
              key={t}
              theme={t}
              selected={chips[t]}
              onClick={() => setChips({ ...chips, [t]: !chips[t] })}
            >
              {t}
            </Chip>
          ))}
          <Chip
            theme="outlined"
            selected
            leadingIcon={iconFilter}
            onRemove={() => undefined}
          >
            총무부
          </Chip>
        </div>
      </Section>

      <Section title="Input">
        <div style={{ ...row, alignItems: 'flex-start' }}>
          <div style={{ width: 360 }}>
            <Input
              leadingIcon={iconSearch}
              placeholder="플레이스홀더"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
          </div>
          <div style={{ width: 360 }}>
            <Input
              leadingIcon={iconSearch}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onClear={() => setText('')}
              error
            />
          </div>
          <div style={{ width: 360 }}>
            <Input placeholder="Disabled" disabled />
          </div>
        </div>
      </Section>

      <Section title="Control">
        <div style={row}>
          {(Object.keys(controls) as ControlType[]).map((t) => (
            <Control
              key={t}
              type={t}
              label={t}
              checked={controls[t]}
              onChange={(c) =>
                setControls({
                  ...controls,
                  [t]: t === 'radio' ? !controls[t] : c,
                })
              }
            />
          ))}
        </div>
        <div style={row}>
          {(Object.keys(controls) as ControlType[]).map((t) => (
            <Control
              key={t}
              type={t}
              label={t + ' disabled'}
              checked={controls[t]}
              disabled
            />
          ))}
        </div>
      </Section>

      <Section title="Avatar · Divider">
        <div style={row}>
          {(['person', 'classroom'] as const).map((t) =>
            (['small', 'medium', 'large'] as const).map((s) => (
              <Avatar key={t + s} type={t} size={s} />
            )),
          )}
        </div>
        {(['small', 'medium', 'large'] as const).map((s) => (
          <Divider key={s} size={s} />
        ))}
      </Section>

      <Section title="Molecules (mobile width)">
        <div style={{ ...row, alignItems: 'flex-start' }}>
          <div style={mobile}>
            <NavigationBar
              type="index-logo"
              primary={{ icon: iconSearch, label: '검색' }}
              secondary={{ icon: iconNotifications, label: '알림' }}
            />
            <NavigationBar
              type="index-text"
              title="타이틀"
              primary={{ icon: iconSearch, label: '검색' }}
            />
            <NavigationBar
              type="page"
              title="타이틀"
              primary={{ icon: iconMore, label: '더보기' }}
            />
            <SegmentedControl
              label="보기"
              items={[
                { value: 'a', label: '전체' },
                { value: 'b', label: '진행 중' },
                { value: 'c', label: '완료' },
              ]}
              value={segment}
              onChange={setSegment}
            />
            <OptionPicker
              label="공개 범위"
              items={[
                { value: 'a', label: '전체 공개', subLabel: '모든 학생' },
                { value: 'b', label: '학생회 내부', subLabel: '임원만' },
              ]}
              value={option}
              onChange={setOption}
            />
            <InputField
              title="안건 제목"
              placeholder="제목을 입력해 주세요"
              subLabel="30자 이내로 적어 주세요."
            />
            <Header
              subTitle="서브 타이틀"
              title="타이틀"
              content="학생회가 모은 건의를 안건으로 올리고, 진행 과정을 모두에게 공개해요."
            />
            <Header
              size="small"
              subTitle="서브 타이틀"
              title="타이틀"
              content="학생회가 모은 건의를 안건으로 올리고, 진행 과정을 모두에게 공개해요."
            />
          </div>
          <div style={mobile}>
            <SectionHeader size="large" title="타이틀" value="서브 타이틀" />
            <SectionHeader
              size="medium"
              title="타이틀"
              trailing={<TextButton size="small">전체 보기</TextButton>}
            />
            <SectionHeader
              size="small"
              title="타이틀"
              leftIcon={iconSchedule}
              value="서브 타이틀"
            />
            <ValueList subTitle="서브 타이틀" title="타이틀" content="내용" />
            <ValueList
              theme="active"
              subTitle="서브 타이틀"
              title="타이틀"
              content="내용"
              onClick={() => undefined}
            />
            <ValueList
              theme="disabled"
              subTitle="서브 타이틀"
              title="타이틀"
              content="내용"
            />
            <ValueList
              direction="column"
              subTitle="서브 타이틀"
              title="타이틀"
              content="내용"
            />
            <ItemList
              leading={<Icon icon={iconAssignment} />}
              subTitle="서브 타이틀"
              title="타이틀"
              content="내용"
              trailing={<Icon icon={iconArrowForwardIos} />}
              onClick={() => undefined}
            />
            <ItemList
              size="small"
              leading={<Avatar size="small" />}
              subTitle="서브 타이틀"
              title="타이틀"
              content="내용"
            />
            <ButtonGroup
              buttons={[{ children: '이전' }, { children: '다음' }]}
              subLabel="서브 레이블"
            />
            <ActionButton
              primary={{ children: '안건 등록' }}
              secondary={{ children: '임시 저장' }}
              direction="column"
              subLabel="서브 레이블"
            />
            <div style={{ padding: 'var(--kit-spacing-400)' }}>
              <Toast icon={iconCheck}>저장했어요</Toast>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Brand">
        <div style={row}>
          <BrandMark set="Logo/COUNCIL" size={48} />
          <BrandMark set="Logo/COUNCIL" variant="mono" size={48} />
          <BrandMark set="Symbol/COUNCIL" size={48} />
          <BrandMark set="Symbol/COUNCIL" variant="mono" size={48} />
          <BrandMark set="Symbol/COUNCIL" variant="outlined" size={48} />
          <BrandMark set="Symbol/DIMIGO" size={48} />
          <BrandMark set="Symbol/DIMIGO" variant="mono" size={48} />
          <BrandMark set="Symbol/DIMIGOIN" size={48} />
          <BrandMark set="Symbol/DIMIGOIN" variant="mono" size={48} />
          <BrandMark set="Symbol/DIMIGOIN" variant="outlined" size={48} />
        </div>
      </Section>

      <Section title={`Icons (${kitIcons.length})`}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
            gap: 'var(--kit-spacing-300)',
          }}
        >
          {kitIcons.map((i) => (
            <div
              key={i.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--kit-spacing-100)',
              }}
              title={i.name}
            >
              <Icon icon={i} />
              <span
                className="kit-text-caption-weak"
                style={{
                  color: 'var(--kit-core-glyph-tertiary)',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {i.name}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
