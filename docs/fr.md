# Fête du jour

## Présentation

Cette intégration apporte dans Gladys la fête de chaque jour du calendrier traditionnel français : « Bonne fête Valérie » le 28 avril, « Fête nationale · Bonne fête Camille » le 14 juillet.

- Un **calendrier Gladys** « Fêtes du jour » pour chaque utilisateur qui l’active : un événement d’une journée par jour, de 7 jours en arrière à un an en avance.
- Un **déclencheur de scène** « Fête du jour », chaque jour à l’heure choisie, ou seulement le jour de la fête des prénoms que vous choisissez (le vôtre, ceux de vos proches).
- Une **action de scène** « Obtenir la fête du jour » (aujourd’hui ou demain), avec une phrase toute prête à envoyer.
- Un **widget** « Fête du jour » : la fête d’aujourd’hui et celles des jours suivants.

![Le widget Fête du jour (illustration générée, pas une capture d’écran)](https://raw.githubusercontent.com/William-De71/gladys-fete-du-jour/main/docs/assets/widgets.fr.png)

L’image ci-dessus est une illustration générée, pas une capture d’écran.

## Prérequis

- Gladys Assistant 5.2.0 ou plus récent (intégrations de type calendrier).
- Le fuseau horaire de Gladys correctement réglé (**Paramètres > Système**) : les jours changent à son minuit.
- Rien d’autre avec la liste intégrée. Pour fetedujour.fr : une clé gratuite et une adresse IP publique **fixe** (voir plus bas).

## Configuration

| Champ                         | Description                                                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heure de l’événement de scène | L’heure (0 à 23) à laquelle le déclencheur « Fête du jour » démarre chaque jour. 8 par défaut.                                                                                                             |
| Langue des textes             | Résumés des scènes et état. Automatique : la langue de votre tableau de bord dès que le widget a été affiché, devinée d’après le fuseau horaire avant. Le calendrier suit la langue de chaque utilisateur. |
| Clé fetedujour.fr             | Facultative. Vide : la liste intégrée.                                                                                                                                                                     |

Puis, dans le bloc **Mes calendriers** de la page de l’intégration, cliquez sur **Activer pour moi** : votre calendrier « Fêtes du jour » apparaît dans le calendrier de Gladys. Il est **privé** au départ : pour l’utiliser dans les scènes ou le montrer au foyer, activez **Partager avec le foyer**. Chaque utilisateur active le sien.

## D’où viennent les noms

- **Liste intégrée** (par défaut) : le calendrier traditionnel français, un saint par jour (351 prénoms), avec les fêtes et jours fériés (Toussaint, Noël, Fête nationale…). Quand une fête a un prénom associé, il est donné avec elle : Martin le 11 novembre, Camille le 14 juillet, Marie le 15 août. Aucune connexion n’est nécessaire. Le 29 février (Auguste) n’existe que les années bissextiles.
- **fetedujour.fr** (facultatif) : générez une clé gratuite sur [fetedujour.fr/api](https://fetedujour.fr/api/) en indiquant l’adresse IP publique de votre box, puis collez-la dans la configuration. **Cette clé ne fonctionne que depuis cette adresse IP** : si votre fournisseur d’accès vous donne une adresse qui change, la clé cessera de fonctionner. L’intégration demande chaque jour de l’année une seule fois (une requête toutes les 30 secondes, environ trois heures la première fois, aujourd’hui d’abord) et garde les réponses ; les fêtes de la liste intégrée restent telles quelles. Tant qu’un jour n’est pas lu, et chaque fois que fetedujour.fr refuse la clé ou ne répond pas, la liste intégrée prend le relais.

L’état en haut de la page de configuration indique la source utilisée et l’avancement (« fetedujour.fr : 120 jours sur 366 lus »).

## Utilisation

### Calendrier

Le calendrier « Fêtes du jour » s’affiche dans la vue calendrier de Gladys, avec les autres. Le déclencheur Gladys « Un évènement dans le calendrier arrive » fonctionne aussi dessus, une fois le calendrier partagé avec le foyer.

### Widget

**Fête du jour** : le prénom du jour en grand (ou la fête), la date et un « Bonne fête aux Valérie ! », puis les jours suivants (0 à 7, réglage « Jours suivants »). Les fêtes sont en bleu.

### Scènes

Déclencheur **Fête du jour**, envoyé une fois par jour à l’heure de la configuration (jamais deux fois le même jour ; si Gladys était arrêtée à cette heure, il arrive à son retour, le même jour). Filtre **Prénoms** : laissé vide, la scène démarre chaque jour ; sinon seulement le jour de la fête des prénoms choisis.

Variables : prénom du jour, fête ou jour férié (vide la plupart des jours), jour (AAAA-MM-JJ) et une phrase toute prête (« Aujourd’hui, nous fêtons les Valérie. »).

Action **Obtenir la fête du jour** : aujourd’hui ou demain ; renvoie le prénom, la fête, le jour et la phrase (« Demain, nous fêterons les Catherine de Sienne. »).

Exemples :

- Chaque jour à 8 h (déclencheur Fête du jour) → envoyer « {{triggerEvent.data.summary}} » sur la messagerie de la famille.
- Fête du jour, prénoms Valérie et Martin → envoyer un message pour ne pas oublier de leur souhaiter leur fête.
- Chaque soir à 20 h → obtenir la fête de demain → l’annoncer sur l’enceinte du salon.

### Transport

Local avec la liste intégrée : rien ne quitte votre Gladys. Avec une clé, l’intégration appelle aussi fetedujour.fr (cloud), et uniquement ce site.

## Dépannage

- **« fetedujour.fr a refusé la clé »** : la clé est liée à une adresse IP publique fixe. Vérifiez que l’adresse de votre box est celle donnée à la création de la clé, sinon générez-en une nouvelle. La liste intégrée est utilisée en attendant ; l’intégration réessaie toutes les 6 heures, et tout de suite après un changement de clé.
- **Le calendrier n’apparaît pas** : activez l’intégration pour vous dans « Mes calendriers ». Pour les scènes, partagez-le avec le foyer.
- **La fête est décalée d’un jour** : vérifiez le fuseau horaire de Gladys (Paramètres > Système).
- **Autre chose** : ouvrez une issue sur GitHub (https://github.com/William-De71/gladys-fete-du-jour/issues) avec les versions de Gladys et de l’intégration, la source utilisée, l’état affiché dans la configuration et les journaux de l’intégration (Paramètres > Supervision). Ne collez jamais votre clé.
