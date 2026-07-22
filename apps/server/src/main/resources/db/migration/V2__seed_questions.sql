insert into questions (id, category, chapter, title, prompt, kind, guidance, placeholder, sort_order) values
('favorite-color', 'preference', '취향에 관한 질문', '좋아하는 색', '요즘 자꾸 눈이 가는 색은 무엇인가요?', 'choice', null, null, 10),
('mbti-now', 'personality', '성격에 관한 질문', '요즘의 MBTI', '요즘의 나를 설명할 때 MBTI를 사용한다면 무엇인가요?', 'choice', '진단 결과가 아니라, 지금의 나를 표현하는 참고 정보예요.', null, 20),
('learning-now', 'learning', '배움에 관한 질문', '배우는 중', '아직 서툴지만 천천히 배우는 것은 무엇인가요?', 'text', null, '예: 조급해하지 않고 쉬는 법', 30),
('value-now', 'value', '가치에 관한 질문', '중요하게 여기는 것', '결정을 내릴 때 놓치고 싶지 않은 것은 무엇인가요?', 'text', null, '정답보다 나다운 이유를 적어보세요.', 40),
('strength-now', 'strength', '강점에 관한 질문', '나의 강점', '사람들이 알아줬으면 하는 나의 강점이 있나요?', 'text', null, '그렇게 느꼈던 장면도 함께 떠올려보세요.', 50),
('support-now', 'support', '도움에 관한 질문', '도움이 필요한 것', '혼자보다 누군가와 함께하면 좋은 것은 무엇인가요?', 'text', null, '도움을 요청하는 방식도 나를 설명해요.', 60);

insert into question_options (question_id, option_order, label, option_value, swatch) values
('favorite-color', 1, '이끼 초록', '이끼 초록', '#456349'),
('favorite-color', 2, '해 질 녘 산호', '해 질 녘 산호', '#A8462F'),
('favorite-color', 3, '깊은 잉크 블루', '깊은 잉크 블루', '#315D7A'),
('favorite-color', 4, '따뜻한 황토', '따뜻한 황토', '#8A641F'),
('mbti-now', 1, 'INFP', 'INFP', null),
('mbti-now', 2, 'INFJ', 'INFJ', null),
('mbti-now', 3, 'ENFP', 'ENFP', null),
('mbti-now', 4, 'INTJ', 'INTJ', null),
('mbti-now', 5, '직접 쓰기', '직접 쓰기', null);
