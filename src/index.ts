import { $query, $update, Result, Record, StableBTreeMap, ic, Opt, Vec, match, nat64 } from 'azle';
import { v4 as uuidv4 } from 'uuid';

/**
 * This type represents player
 *  People could be player or maker
 *      -> Player are playing to earn score
 *      -> Makerr are building courses, questions
 */
type Player = Record<{
    id:             number;
    name:           string;
    score:          nat64;
    createdAt:      nat64;
    updatedAt:      Opt<nat64>;
}>;

type PlayerPayload = Record<{
    name:           string;
    score:          nat64;
}>;

let players: Vec<Player> = [];

/**
 * This type represents a qyestion
 *  A qyestion is represented with id, set of keywords, content, answer...
 */
type Question = Record<{
    id:             string;
    title:          string;
    keywords:       Opt<Vec<string>>;
    statement:      string;
    suggested:      Vec<string>;
    answer:         string;
    value:          nat64;
    createdAt:      nat64;
    updatedAt:      Opt<nat64>;
}>;
type QuestionPayload = Record<{
    title:          string;
    keywords:       Opt<Vec<string>>;
    statement:      string;
    suggested:      Vec<string>;
    answer:         string;
    value:          nat64;
}>

const questionsStorage = new StableBTreeMap<string, Question>(0, 44, 1024);


//  CRUD Functions

$query;
export function getQuestions(): Result<Vec<Question>, string> {
    return Result.Ok<Vec<Question>, string>(questionsStorage.values());
}

$query;
export function getQuestion(id: string): Result<Question, string> {
    return match(questionsStorage.get(id), {
        Some: (question) => Result.Ok<Question, string>(question),
        None: () =>         Result.Err<Question, string>(`can't find question cause no id={$id} found`)
    });
}

$update;
export function addQuestion(payload: QuestionPayload): Result<Question, string> {
    const question: Question = { id: uuidv4(), ...payload, createdAt: ic.time(), updatedAt: Opt.None};
    questionsStorage.insert(question.id, question);
    return Result.Ok<Question, string>(question);
}

$update;
export function updateQusetion(id: string, payload: QuestionPayload): Result<Question, string> {
    return match(questionsStorage.get(id), {
        Some:   (question) => {
            const updatedQuestion: Question = { ...question, ...payload, updatedAt: Opt.Some(ic.time()) };
            questionsStorage.insert(id, updatedQuestion);
            return Result.Ok<Question, string>(updatedQuestion);
        },
        None: () => Result.Err<Question, string>(`There is no question found with id={$id}`)
    });
}

$update;
export function removeQuestion(id: string): Result<Question, string> {
    return match(questionsStorage.remove(id), {
        Some:   (deletedMessage) => Result.Ok<Question, string>(deletedMessage),
        None:   () => Result.Err<Question, string>(`can't delete cause no question found with id={$id}`)
    });
}