# 🌍 English Learning Platform

Une plateforme d'apprentissage de l'anglais moderne et interactive, construite avec Angular 20 et TypeScript.

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API et Services](#api-et-services)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Licence](#licence)

## 🎯 Aperçu

English Learning Platform est une application web complète conçue pour faciliter l'apprentissage de l'anglais. Elle offre des cours structurés, des examens interactifs, et un système de gestion des utilisateurs avec des rôles différenciés (étudiants et administrateurs).

### 🎨 Captures d'écran

*[Ajoutez ici des captures d'écran de votre application]*

## ✨ Fonctionnalités

### 👤 Gestion des utilisateurs
- **Inscription et connexion** sécurisées
- **Profils utilisateurs** personnalisables
- **Système de rôles** (Utilisateur/Administrateur)
- **Authentification** avec tokens JWT

### 📚 Gestion des cours
- **Catalogue de cours** par niveau (Débutant, Intermédiaire, Avancé)
- **Leçons structurées** avec contenu détaillé
- **Suivi de progression** en temps réel
- **Durée estimée** pour chaque cours

### 📝 Système d'examens
- **Questions variées** : QCM, Vrai/Faux, Remplissage
- **Examens chronométrés** avec sauvegarde automatique
- **Correction automatique** et calcul de scores
- **Historique des tentatives** et résultats détaillés

### 👨‍💼 Tableau de bord administrateur
- **Gestion des cours** (création, modification, suppression)
- **Gestion des examens** et questions
- **Gestion des utilisateurs**
- **Statistiques** et rapports

### 🎨 Interface utilisateur
- **Design responsive** avec Tailwind CSS
- **Interface moderne** et intuitive
- **Navigation fluide** entre les sections
- **Thème cohérent** et professionnel

## 🛠 Technologies utilisées

### Frontend
- **Angular 20** - Framework principal
- **TypeScript 5.9** - Langage de programmation
- **Tailwind CSS 4.1** - Framework CSS
- **RxJS 7.8** - Programmation réactive
- **Angular Forms** - Gestion des formulaires

### Outils de développement
- **Angular CLI 20.2** - Outils de développement
- **ESLint** - Analyse de code
- **Prettier** - Formatage de code
- **Karma & Jasmine** - Tests unitaires
- **PostCSS** - Traitement CSS

### Architecture
- **Standalone Components** - Architecture moderne Angular
- **Signals** - Gestion d'état réactive
- **Lazy Loading** - Chargement à la demande
- **Guards** - Protection des routes
- **Interceptors** - Gestion des requêtes HTTP

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure)
- **npm** (version 9 ou supérieure)
- **Angular CLI** (version 20 ou supérieure)

```bash
# Vérifier les versions
node --version
npm --version
ng version
```

## 🚀 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/norab0/english-learning-platform.git
cd english-learning-platform
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer le serveur de développement**
```bash
npm start
```

4. **Ouvrir l'application**
```
http://localhost:4200
```

## 🎮 Utilisation

### Première utilisation

1. **Créer un compte** via la page d'inscription
2. **Se connecter** avec vos identifiants
3. **Parcourir les cours** disponibles
4. **Commencer un cours** et suivre votre progression
5. **Passer des examens** pour valider vos acquis

### Rôles utilisateur

#### 👤 Utilisateur standard
- Consulter le catalogue de cours
- Suivre des cours et leçons
- Passer des examens
- Consulter ses résultats
- Modifier son profil

#### 👨‍💼 Administrateur
- Toutes les fonctionnalités utilisateur
- Créer et gérer des cours
- Créer et gérer des examens
- Gérer les utilisateurs
- Consulter les statistiques

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/                    # Services et modèles partagés
│   │   ├── guards/             # Guards de protection des routes
│   │   ├── interceptors/       # Intercepteurs HTTP
│   │   ├── models/             # Interfaces TypeScript
│   │   └── services/           # Services globaux
│   ├── features/               # Modules fonctionnels
│   │   ├── auth/              # Authentification
│   │   ├── courses/           # Gestion des cours
│   │   ├── exams/             # Système d'examens
│   │   └── users/             # Gestion des utilisateurs
│   ├── shared/                # Composants partagés
│   │   ├── components/        # Composants réutilisables
│   │   ├── directives/        # Directives personnalisées
│   │   └── pipes/             # Pipes personnalisés
│   ├── app.config.ts          # Configuration de l'application
│   ├── app.routes.ts          # Routes principales
│   └── app.ts                 # Composant racine
├── styles.css                 # Styles globaux
└── main.ts                    # Point d'entrée
```

## 🔧 API et Services

### Services principaux

#### AuthService
- Gestion de l'authentification
- Gestion des tokens JWT
- Gestion des sessions utilisateur

#### CoursesService
- CRUD des cours
- Gestion de la progression
- Sauvegarde locale des données

#### ExamsService
- Gestion des examens
- Calcul des scores
- Sauvegarde des tentatives

#### UsersService
- Gestion des utilisateurs
- Gestion des profils
- Statistiques utilisateur

### Modèles de données

#### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  token: string;
  createdAt: Date;
  lastLogin?: Date;
}
```

#### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Exam
```typescript
interface Exam {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  duration: number;
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Tests

### Lancer les tests
```bash
# Tests unitaires
npm test

# Tests en mode CI
npm run test:ci

# Tests e2e
npm run e2e
```

### Couverture de tests
Les tests couvrent :
- Services et logique métier
- Composants et interfaces
- Guards et interceptors
- Pipes et directives

## 🚀 Déploiement

### Build de production
```bash
npm run build:prod
```

### Variables d'environnement
Créer un fichier `src/environments/environment.prod.ts` :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-url.com',
  // Autres configurations
};
```

## 📊 Scripts disponibles

```bash
# Développement
npm start                 # Serveur de développement
npm run build            # Build de développement
npm run build:prod       # Build de production
npm run watch            # Build en mode watch

# Tests
npm test                 # Tests unitaires
npm run test:ci          # Tests en mode CI
npm run e2e              # Tests end-to-end

# Qualité de code
npm run lint             # Analyse ESLint
npm run lint:fix         # Correction automatique ESLint
```


## 🔮 Roadmap

### Version 1.0.0
- [ ] Intégration API backend
- [ ] Système de paiement
- [ ] Certificats de completion
- [ ] Chat en temps réel

### Version 1.1.0
- [ ] Application mobile
- [ ] Mode hors ligne
- [ ] Synchronisation cloud
- [ ] Analytics avancées


## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

