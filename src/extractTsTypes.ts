import { TypeLiteralNode, SourceFile, SyntaxKind, TypeElementTypes, ts, TypeNode, TypeElementMemberedNode, ObjectLiteralExpression } from "ts-morph";
import { FlatTypesRegistry } from './runtime/nuxtMockerTypes'

export default async () => {
  const sourceFiles = await getTsSourceFiles()

  const flatTypes = sourceFiles.reduce(
    (tsTypes: FlatTypesRegistry, sourceFile) => {
      if ([ 'module', 'htmlTagInjectionTypes', 'mockableTypes', 'nuxtMockerTypes' ].includes(sourceFile.getBaseNameWithoutExtension())) {

        return tsTypes
      }
      return {
        ...tsTypes,
        ...extractInterfaces(sourceFile),
        ...extractTypeAliases(sourceFile),
      };
    },
    {}
  )

  return flatTypes
};

const getTsSourceFiles = async () => {
  const { Project } = await import("ts-morph")

  return new Project({
    tsConfigFilePath: "tsconfig.json",
    compilerOptions: {
      lib: ["DOM", "ESNext"],
      allowJs: false,
      strictNullChecks: true,
    },
  }).getSourceFiles();
};



const extractInterfaces = (sourceFile: SourceFile) =>
  sourceFile.getInterfaces().reduce((sourceFileInterfaces, interfaceItem) => {
    if (interfaceItem.getMembers().length > 0) {

      return {
        ...sourceFileInterfaces,
        [interfaceItem.compilerNode.name.getText()]: {
          object: interfaceItem.getMembers().reduce(
            extractMembers,
            {}
          ),
          isCollection: false,
          isNullable: false,
        },
      };
    }

    return sourceFileInterfaces;
  }, 
  {}
);

const extractTypeAliases = (sourceFile: SourceFile) =>
  sourceFile.getTypeAliases().reduce((sourceFileTypeAliases, typeAlias) => {
    
    const typeNode = typeAlias.getTypeNode()
    if (typeNode?.getKindName() === 'TypeLiteral') {

      return {
        ...sourceFileTypeAliases,
        [typeAlias.getName()]: {
          object: (typeNode as TypeLiteralNode).getMembers().reduce(
            extractMembers,
            {}
          ),
          isCollection: false,
          isNullable: false,
        }
      };
    }

    return sourceFileTypeAliases
  }, 
  {}
);

const extractMembers = (members: FlatTypesRegistry | {}, member: TypeElementTypes) => {
  const memberType = member.getType()
  const memberSymbol = member.getSymbol()
  if (memberSymbol) {
    // Array
    if (memberType.isArray()) {

      return {
        ...members,
        [memberSymbol.getName()]: {
          typeName: (member.compilerNode.type as ts.ArrayTypeNode).elementType.getText(),
          isNullable: memberType.isNullable(),
          isCollection: true
        },
      }
    }
    // Tuple
    if (memberType.isTuple()) {
      const tuple =  (member.compilerNode.type as ts.TupleTypeNode).elements.map(
        element => {
          const isCollection = element.kind === SyntaxKind.ArrayType
          
          return {
            typeName: isCollection ? element.getText().slice(0,-2) : element.getText(),
            isNullable: false,
            isCollection
          }
        }
      )
  
      return {
        ...members,
        [memberSymbol.getName()]: {
          tuple,
          isNullable: member.getType().isNullable(),
          isCollection: false,
        },
      }
    }

    // Union
    if (member.compilerNode.type?.kind === SyntaxKind.UnionType) {
      const union = (member.compilerNode.type as ts.UnionTypeNode).types.map(
        type => {
          if (type.kind === SyntaxKind.LiteralType) {
            
            return {
              literal: getLiteralValue(type as ts.LiteralTypeNode),
              isNullable: false,
              isCollection: false,
            }
          }
          const isCollection = type.kind === SyntaxKind.ArrayType
          return {
            typeName: isCollection ? type.getText().slice(0,-2) : type.getText(),
            isNullable: false,
            isCollection
          }
        }
      )

      return {
        ...members,
        [memberSymbol.getName()]: {
          union,
          isNullable: memberType.isNullable(),
          isCollection: false
        } 
      }
    }

    // Object
    if (memberType.isObject()) {
      const subType = member.getChildrenOfKind(SyntaxKind.TypeLiteral)[0]
      if (subType) {
        const object: FlatTypesRegistry = subType.getChildrenOfKind(SyntaxKind.PropertySignature).reduce(
          extractMembers,
          {}
        )

        return {
          ...members,
          [memberSymbol.getName()]: {
            object,
            isNullable: member.getType().isNullable(),
            isCollection: false
          },
        }
      }
    }

    // @todo: should implement Record<>

    // Simple
    return {
      ...members,
      [memberSymbol.getName()]: {
        typeName: member.compilerNode.type?.getText(),
        isNullable: memberType.isNullable(),
        isCollection: false
      },
    }
  }
  
  return members
}

const getLiteralValue = (type: ts.LiteralTypeNode) => {
  switch(true) {
    case type.literal.kind === SyntaxKind.StringLiteral:
      return type.literal.getText().slice(1,-1)
    case type.literal.kind === SyntaxKind.TrueKeyword:
      return true
    case type.literal.kind === SyntaxKind.FalseKeyword:
      return false
    case type.literal.kind === SyntaxKind.NumericLiteral:
      return parseFloat(type.literal.getText())
    default:
      return undefined
  }
}