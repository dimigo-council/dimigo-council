import { useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Checkbox,
  Chip,
  Count,
  ListGroup,
  ListRow,
  Notice,
  OptionCard,
  OptionCardGroup,
  Radio,
  SegmentedControl,
  Select,
  Switch,
  Tabs,
  Tag,
  TextArea,
  TextField,
} from './index.ts';
import './KitPreview.css';

const categories = ['급식', '시설', '기숙사'] as const;

/** 개발 서버에서 `/kit`로 여는 컴포넌트 확인 화면. 배포 빌드에는 포함되지 않는다. */
export default function KitPreview() {
  const [tab, setTab] = useState<'open' | 'mine' | 'closed'>('open');
  const [title, setTitle] = useState('기숙사 세탁실 건조기가 부족해요');
  const [body, setBody] = useState('');
  const [view, setView] = useState<'list' | 'board'>('list');
  const [category, setCategory] = useState<string>('급식');
  const [identity, setIdentity] = useState('anonymous');

  return (
    <main className="kit-preview">
      <h1>DIMI UI KIT 컴포넌트</h1>

      <section>
        <h2>Button</h2>
        <div className="kit-preview__row">
          <Button variant="primary">건의 보내기</Button>
          <Button>취소</Button>
          <Button variant="ghost">편집</Button>
          <Button variant="danger">반려하기</Button>
          <Button size="sm">작게</Button>
          <Button variant="primary" disabled>
            비활성
          </Button>
        </div>
      </section>

      <section>
        <h2>TextField, Select, TextArea</h2>
        <div className="kit-preview__grid">
          <TextField
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            hint="구체적으로 적어주세요."
          />
          <Select label="담당 부서" defaultValue="생활복지부">
            <option>생활복지부</option>
            <option>학습부</option>
            <option>체육부</option>
          </Select>
          <TextField label="제목" defaultValue="" error="제목을 적어주세요." />
          <TextField label="학번" value="2학년 3반" disabled readOnly />
        </div>
        <TextArea
          label="하고 싶은 말"
          optional
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={500}
          showCount
          placeholder="개인을 특정할 수 있는 내용은 적지 말아주세요."
        />
      </section>

      <section>
        <h2>Badge, Tag, Count, Avatar</h2>
        <div className="kit-preview__row">
          <Badge>접수 대기</Badge>
          <Badge tone="info">추진 중</Badge>
          <Badge tone="warn">검토 중</Badge>
          <Badge tone="success">완료</Badge>
          <Badge tone="danger">반려</Badge>
          <Tag>기숙사</Tag>
          <Count value={12} />
          <Count value={7} alert />
          <Avatar name="김하린" />
          <AvatarGroup names={['김하린', '최유나', '박지민']} />
        </div>
      </section>

      <section>
        <h2>Tabs</h2>
        <Tabs
          aria-label="설문 보기"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'open', label: '진행 중', count: 3 },
            { value: 'mine', label: '내가 응답한 설문', count: 6 },
            { value: 'closed', label: '마감된 설문', count: 12 },
          ]}
        />
      </section>

      <section>
        <h2>Checkbox, Radio, Switch</h2>
        <div className="kit-preview__row">
          <Checkbox label="선택됨" defaultChecked />
          <Checkbox label="선택 안 됨" />
          <Radio label="선택됨" name="preview-radio" defaultChecked />
          <Radio label="선택 안 됨" name="preview-radio" />
          <Switch label="필수 응답" defaultChecked />
          <Switch label="알림 받기" />
          <Checkbox label="비활성" disabled defaultChecked />
        </div>
      </section>

      <section>
        <h2>SegmentedControl, Chip</h2>
        <div className="kit-preview__row">
          <SegmentedControl
            aria-label="보기 방식"
            value={view}
            onChange={setView}
            items={[
              { value: 'list', label: '목록' },
              { value: 'board', label: '보드' },
            ]}
          />
          {categories.map((name) => (
            <Chip
              key={name}
              selected={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </Chip>
          ))}
          <Chip value="전체" aria-haspopup="listbox">
            부서
          </Chip>
        </div>
      </section>

      <section>
        <h2>OptionCard</h2>
        <OptionCardGroup legend="이름 공개">
          {[
            {
              value: 'named',
              title: '실명으로 보내기',
              description: '담당 부서에만 이름과 학번이 보입니다.',
            },
            {
              value: 'anonymous',
              title: '익명으로 보내기',
              description: '학생회에도 이름이 보이지 않습니다.',
            },
            {
              value: 'later',
              title: '나중에 정하기',
              description: '임시 저장 상태로 둡니다.',
            },
          ].map((option) => (
            <OptionCard
              key={option.value}
              name="preview-identity"
              value={option.value}
              title={option.title}
              description={option.description}
              checked={identity === option.value}
              onChange={() => setIdentity(option.value)}
            />
          ))}
        </OptionCardGroup>
      </section>

      <section>
        <h2>ListRow</h2>
        <ListGroup aria-label="진행 중인 설문">
          <ListRow
            title="2학기 체육대회 종목 선호 조사"
            href="#survey-1"
            meta={['전교생', '6문항, 약 2분', '익명']}
            aside={
              <>
                <strong className="kit-preview__dday">D-4</strong>
                <span>10.30 (금) 마감</span>
              </>
            }
            actions={
              <Button variant="primary" size="sm">
                응답하기
              </Button>
            }
          />
          <ListRow
            title="10월 급식 만족도 조사"
            href="#survey-2"
            meta={['전교생', '10문항, 약 4분', '익명']}
            aside={<Badge tone="success">응답 완료</Badge>}
            actions={<Button size="sm">응답 수정</Button>}
          />
        </ListGroup>
      </section>

      <section>
        <h2>Notice</h2>
        <div className="kit-preview__stack">
          <Notice>익명 설문입니다. 응답과 응답자는 연결되지 않습니다.</Notice>
          <Notice tone="warn">
            본문에 사람 이름으로 보이는 표현이 있습니다.
          </Notice>
          <Notice tone="neutral">
            건의가 안건으로 채택되면 내용이 요약돼 학생회 활동에 공개될 수
            있습니다.
          </Notice>
        </div>
      </section>
    </main>
  );
}
