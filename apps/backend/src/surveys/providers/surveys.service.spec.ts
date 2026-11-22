import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Permission, type SurveyQuestion } from '#/db/schema/index';
import { mockDatabase } from '../../../test/mock-db.ts';
import { SurveysService } from './surveys.service.ts';

const questions: SurveyQuestion[] = [
  {
    id: 'q1',
    type: 'single',
    title: '좋아요?',
    required: true,
    options: ['예', '아니요'],
  },
];
const student = {
  id: '00000000-0000-0000-0000-000000000001',
  name: '학생',
  permissions: 0,
  grade: 2,
  class: 3,
};

function surveyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    title: '급식 설문',
    intro: '',
    activityId: 1,
    departmentId: null,
    ownerId: null,
    grades: [1, 2, 3],
    collectsClass: false,
    questions,
    stage: 'published',
    opensAt: new Date(Date.now() - 86_400_000),
    closesAt: new Date(Date.now() + 86_400_000),
    closedAt: null,
    reviewRequested: false,
    createdAt: new Date(),
    savedAt: new Date(),
    ...overrides,
  };
}

describe('SurveysService responses', () => {
  it('stores an answer without anything that identifies the respondent', async () => {
    const mock = mockDatabase()
      .on('select', 'surveys', [surveyRow()])
      .on('insert', 'survey_participants', [{ surveyId: 7 }])
      .on('insert', 'survey_responses', []);
    const service = new SurveysService(mock.database);

    await expect(
      service.respond(student, 7, {
        answers: { q1: '예' },
        durationSeconds: 30,
      }),
    ).resolves.toEqual({ myStatus: 'submitted' });

    expect(
      mock.queries('insert', 'survey_participants')[0].arg('values'),
    ).toEqual({
      surveyId: 7,
      userId: student.id,
    });
    const response = mock
      .queries('insert', 'survey_responses')[0]
      .arg('values');
    expect(response).toEqual({
      surveyId: 7,
      answers: { q1: '예' },
      grade: null,
      classNumber: null,
      durationSeconds: 30,
    });
    expect(JSON.stringify(response)).not.toContain(student.id);
  });

  it('keeps 학년/반 only for surveys that collect them', async () => {
    const mock = mockDatabase()
      .on('select', 'surveys', [surveyRow({ collectsClass: true })])
      .on('insert', 'survey_participants', [{ surveyId: 7 }])
      .on('insert', 'survey_responses', []);
    await new SurveysService(mock.database).respond(student, 7, {
      answers: { q1: '예' },
    });
    expect(
      mock.queries('insert', 'survey_responses')[0].arg('values'),
    ).toMatchObject({ grade: 2, classNumber: 3 });
  });

  it('rejects a second response from the same user', async () => {
    const mock = mockDatabase()
      .on('select', 'surveys', [surveyRow()])
      .on('insert', 'survey_participants', []);
    await expect(
      new SurveysService(mock.database).respond(student, 7, {
        answers: { q1: '예' },
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mock.queries('insert', 'survey_responses')).toHaveLength(0);
  });

  it('rejects closed surveys, other grades and invalid answers', async () => {
    const closed = mockDatabase().on('select', 'surveys', [
      surveyRow({ closedAt: new Date() }),
    ]);
    await expect(
      new SurveysService(closed.database).respond(student, 7, {
        answers: { q1: '예' },
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    const firstGrade = mockDatabase().on('select', 'surveys', [
      surveyRow({ grades: [1] }),
    ]);
    await expect(
      new SurveysService(firstGrade.database).respond(student, 7, {
        answers: { q1: '예' },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const invalid = mockDatabase().on('select', 'surveys', [surveyRow()]);
    await expect(
      new SurveysService(invalid.database).respond(student, 7, { answers: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lets council members respond like students', async () => {
    const mock = mockDatabase()
      .on('select', 'surveys', [surveyRow()])
      .on('insert', 'survey_participants', [{ surveyId: 7 }])
      .on('insert', 'survey_responses', []);
    await expect(
      new SurveysService(mock.database).respond(
        { ...student, permissions: Permission.isStudentCouncil },
        7,
        { answers: { q1: '아니요' } },
      ),
    ).resolves.toEqual({ myStatus: 'submitted' });
  });
});

describe('SurveysService publishing', () => {
  it('needs a linked activity to publish', async () => {
    const mock = mockDatabase().on('select', 'surveys', [
      surveyRow({ stage: 'draft', activityId: null }),
    ]);
    await expect(
      new SurveysService(mock.database).publish(student, 7),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mock.queries('update')).toHaveLength(0);
  });

  it('does not edit published surveys', async () => {
    const mock = mockDatabase().on('select', 'surveys', [surveyRow()]);
    await expect(
      new SurveysService(mock.database).update(student, 7, {
        title: '새 제목',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
