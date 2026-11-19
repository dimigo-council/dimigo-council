/**
 * 앱 화면 패턴: DIMI UI KIT(../../dimi-ui-kit)에 없는 조합만 여기 둔다.
 * 버튼·배지·칩·아바타 같은 원자는 kit에서 바로 가져다 쓴다.
 */
import './ui.css';

export {
  TextField,
  TextArea,
  Select,
  SelectControl,
  type TextFieldProps,
  type TextAreaProps,
  type SelectProps,
  type SelectControlProps,
} from './Field.tsx';
export {
  Checkbox,
  Radio,
  Switch,
  ChoiceGroup,
  OptionCard,
  ControlMark,
  type ChoiceProps,
  type ChoiceItem,
  type ChoiceGroupProps,
  type OptionCardProps,
} from './Choice.tsx';
export { Tabs, type TabItem, type TabsProps } from './Tabs.tsx';
export { Notice, type NoticeProps, type NoticeTone } from './Notice.tsx';
export { ListGroup, ListRow, type ListRowProps } from './ListRow.tsx';
export {
  statusTone,
  Count,
  PersonAvatar,
  AvatarGroup,
  buttonLook,
  type StatusTone,
  type CountProps,
} from './misc.tsx';
