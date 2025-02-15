---
date: 2025-02-03
author: Charles Chen
description: Ready to incorporate code reviews into your candidate selection process but not quite sure how to start? Here are 7 strategies to consider; you can even mix and match!
---

# 7 Strategies for Using Code Reviews in Technical Interviews

[{{ $doc.author }}]{.post-author } - [{{ $doc.date }}]{.post-date}

[{{ $doc.description }}]{.post-desc}

When using code reviews as an interview tool, think of it like creating a sandbox or playground for the interviewer and candidate to explore.

Like burying treasures in the sand, the objective is to create multiple points of interest which can allow a candidate to express both their breadth and depth as you explore together.  Unlike leetcode based interviews which can feel more binary in outcome, a well-designed code review can allow for better stratification of candidates by providing a greater range of responses.

Try to keep it interesting by mixing and matching these 7 different strategies in your code review!

---

## 1. "Au naturel"

Take actual, relevant and interesting parts of an active codebase as-is and use those as the context for review. Data access, exception handling, input handling - these all make for great points of focus to see a candidate’s feedback on an existing codebase and how quickly they can read and understand your existing code.

## 2. Bug hunter

Intentionally introduce some logical flaw or defect and see if a candidate can spot it. A good idea is to go back and find recent bugs that were solved and pull the source before the fix was applied. Can the candidate identify the root cause? How would the candidate suggest resolving the defect? How does that response differ from the one that was implemented?

## 3. Refactor and redesign

Recently completed a refactor or planning a refactor? Use the code prior to the refactor as the context and see how the candidate thinks about the code before the refactor and what strategies a candidate would use to plan and execute the refactor. See if the candidate can identify why a refactor would be desired and evaluate the sophistication of their approach; you might be surprised and find an entirely novel alternate approach!

This is particularly useful when a candidate is joining a brownfield project.

## 4. Performance minded

Find code that was recently fixed for a performance issue and see if the candidate can spot why a piece of code might be slow. See if the candidate can propose an algorithm, alternate design, or fix to improve the performance of the code.

Include existing SQL DDL schema and common natural language queries that the application will perform. Remove the index definitions and see if the candidate can propose indices or alternate designs to improve performance.

Instead of asking about the principles of Big-O notation, see if the candidate can actually spot some `O(n^2)` code or `N+1` issues in data access code!

## 5. Test focused

Share a fragment of code and a set of unit tests for the code. Are all the cases covered? Are there cases not covered? How could the unit tests be improved? This perspective may be more important in the coming age of AI generated code: understanding the domain space and use case and how to write high coverage unit tests - or evaluating the completeness of generated unit tests - becomes a key skill.

## 6. Security hawk

Use code that has subtle security flaws and see if the candidate can identify said flaws. Rather than merely asking what an XSS or SQL injection attack is, see if the candidate can identify such flaws in code by using code that lacks protection against said attacks. Again, as teams come to rely on AI-generated code, having the experience to identify potential security flaws in the generated code becomes more important.

## 7. Best practices

For more senior positions, focusing on best practices is a great way to find candidates that can identify, communicate, and teach best practices to more junior candidates and direct reports.

Introduce some code with obvious bad practices and see if the candidate can identify the bad practices and explain why they're bad practices.

---

These strategies are just a start to help you think about ways to utilize code reviews.  Use these as starting points to formulate your own strategies that fit the objectives of your team.

Trying to filter for staff and principal level engineers?  Try incorporating all 7 strategies and see if the candidate has both the breadth and depth to match the leveling for the role.

Code reviews are intended to be open-ended and facilitate communication and collaboration so think of it like creating a sandbox to explore together!
