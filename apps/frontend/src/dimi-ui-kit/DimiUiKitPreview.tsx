import { useEffect, useState, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
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
  Text,
  TextButton,
  Toast,
  ValueList,
  useKitTheme,
  type ControlType,
  type KitMode,
  type KitTextScale,
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

const Page = styled.div`
  ${({ theme: t }) => css`
    min-height: 100vh;
    padding: ${t.spacing[800]} ${t.spacing[900]};
    background: ${t.colors.background.secondary};
    color: ${t.colors.core.glyph.primary};
    font-family: ${t.font.family};
  `}
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[400]};
`;

const TopBar = styled(Row)`
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[800]};
`;

const Switches = styled(Row)`
  width: 560px;
  flex-wrap: nowrap;
`;

const TopRow = styled(Row)`
  align-items: flex-start;
`;

const Card = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[400]};
    padding: ${t.spacing[550]};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
    box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
  `}
`;

const Mobile = styled.div`
  ${({ theme: t }) => css`
    width: 360px;
    background: ${t.colors.background.primary};
    border-radius: ${t.radius.m};
    box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
  `}
`;

const InputSlot = styled.div`
  width: 360px;
`;

const ToastSlot = styled.div`
  padding: ${({ theme }) => theme.spacing[400]};
`;

const SectionRoot = styled.section`
  ${({ theme: t }) => css`
    display: flex;
    flex-direction: column;
    gap: ${t.spacing[400]};
    margin-bottom: ${t.spacing[850]};
  `}
`;

const Heading = styled(Text)`
  margin: 0;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: ${({ theme }) => theme.spacing[300]};
`;

const IconCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[100]};
`;

const IconName = styled(Text)`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SectionRoot>
      <Heading as="h2" $style="headlineStrong">
        {title}
      </Heading>
      <Card>{children}</Card>
    </SectionRoot>
  );
}

const textStyleNames = [
  'display',
  'title',
  'headline',
  'body',
  'callout',
  'footnote',
  'caption',
] as const;
const weightNames = ['Weak', 'Regular', 'Strong'] as const;

/** Dev-only page (/dimi-ui-kit) showing every DIMI UI KIT token and component. */
export default function DimiUiKitPreview() {
  const [theme, setTheme] = useState<KitMode>('light');
  const [scale, setScale] = useState<KitTextScale>('100');
  const { modeOverride, setMode, textScale, setTextScale } = useKitTheme();
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

  // Pin the app theme to the switches (the provider follows the OS until a mode is set),
  // and give the previous mode and text scale back when leaving the page.
  const [previous] = useState({ mode: modeOverride, scale: textScale });
  useEffect(() => setMode(theme), [theme, setMode]);
  useEffect(() => setTextScale(scale), [scale, setTextScale]);
  useEffect(
    () => () => {
      setMode(previous.mode);
      setTextScale(previous.scale);
    },
    [previous, setMode, setTextScale],
  );

  return (
    <Page>
      <TopBar>
        <Row>
          <BrandMark set="Logo/COUNCIL" size={40} label="디미고 학생회" />
          <Heading as="h1" $style="titleStrong">
            DIMI UI KIT
          </Heading>
        </Row>
        <Switches>
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
        </Switches>
      </TopBar>

      <Section title="Text styles">
        {textStyleNames.map((t) => (
          <Row key={t}>
            {weightNames.map((w) => (
              <Text key={w} $style={`${t}${w}`}>
                {t}/{w.toLowerCase()} 디미고
              </Text>
            ))}
          </Row>
        ))}
        <Heading as="p" $style="paragraphLarge">
          Paragraph/Large — 학생회가 모은 건의를 안건으로 올리고, 진행 과정을
          모두에게 공개해요.
        </Heading>
        <Heading as="p" $style="paragraphSmall">
          Paragraph/Small — 학생회가 모은 건의를 안건으로 올리고, 진행 과정을
          모두에게 공개해요.
        </Heading>
      </Section>

      <Section title="Button">
        {(['primary', 'secondary'] as const).map((variant) =>
          (['grayscale', 'accent', 'negative'] as const).map((t) => (
            <Row key={variant + t}>
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
            </Row>
          )),
        )}
      </Section>

      <Section title="TextButton · IconButton">
        {(['grayscale', 'accent', 'negative'] as const).map((t) => (
          <Row key={t}>
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
          </Row>
        ))}
        {(['large', 'medium'] as const).map((s) => (
          <Row key={s}>
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
          </Row>
        ))}
      </Section>

      <Section title="Badge · Chip">
        {(['large', 'small'] as const).map((s) => (
          <Row key={s}>
            {(['grayscale', 'accent', 'negative', 'solid'] as const).map(
              (t) => (
                <Badge key={t} size={s} theme={t} leadingIcon={iconGlobe}>
                  전체 공개
                </Badge>
              ),
            )}
          </Row>
        ))}
        <Row>
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
        </Row>
      </Section>

      <Section title="Input">
        <TopRow>
          <InputSlot>
            <Input
              leadingIcon={iconSearch}
              placeholder="플레이스홀더"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
          </InputSlot>
          <InputSlot>
            <Input
              leadingIcon={iconSearch}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onClear={() => setText('')}
              error
            />
          </InputSlot>
          <InputSlot>
            <Input placeholder="Disabled" disabled />
          </InputSlot>
        </TopRow>
      </Section>

      <Section title="Control">
        <Row>
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
        </Row>
        <Row>
          {(Object.keys(controls) as ControlType[]).map((t) => (
            <Control
              key={t}
              type={t}
              label={t + ' disabled'}
              checked={controls[t]}
              disabled
            />
          ))}
        </Row>
      </Section>

      <Section title="Avatar · Divider">
        <Row>
          {(['person', 'classroom'] as const).map((t) =>
            (['small', 'medium', 'large'] as const).map((s) => (
              <Avatar key={t + s} type={t} size={s} />
            )),
          )}
        </Row>
        {(['small', 'medium', 'large'] as const).map((s) => (
          <Divider key={s} size={s} />
        ))}
      </Section>

      <Section title="Molecules (mobile width)">
        <TopRow>
          <Mobile>
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
          </Mobile>
          <Mobile>
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
            <ToastSlot>
              <Toast icon={iconCheck}>저장했어요</Toast>
            </ToastSlot>
          </Mobile>
        </TopRow>
      </Section>

      <Section title="Brand">
        <Row>
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
        </Row>
      </Section>

      <Section title={`Icons (${kitIcons.length})`}>
        <IconGrid>
          {kitIcons.map((i) => (
            <IconCell key={i.name} title={i.name}>
              <Icon icon={i} />
              <IconName $style="captionWeak">{i.name}</IconName>
            </IconCell>
          ))}
        </IconGrid>
      </Section>
    </Page>
  );
}
